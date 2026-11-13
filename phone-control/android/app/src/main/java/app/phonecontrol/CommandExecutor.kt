package app.phonecontrol

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.accessibility.AccessibilityNodeInfo
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.json.JSONObject

/** What a tool returns: text for Claude, and optionally a JPEG image (screenshot). */
data class ToolResult(val ok: Boolean, val text: String, val imageJpegBase64: String? = null) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("ok", ok)
        put("text", text)
        if (imageJpegBase64 != null) put("image", imageJpegBase64)
    }

    companion object {
        fun error(msg: String) = ToolResult(false, "ERROR: $msg")
    }
}

/**
 * Runs one tool call ("tap", "type_text", ...) on the phone.
 * Used by the Debug screen (Phase 1) and by the relay connection (Phase 2) in exactly the same way.
 *
 * Rules applied to EVERY call:
 *  - Pause switch on  -> refused (and a running call is cancelled at once).
 *  - Accessibility off -> clear error.
 *  - App in front is a bank/UPI/payment/password app -> refused, screen is not even read.
 *  - Calls run one at a time.
 */
object CommandExecutor {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val lock = Mutex()
    @Volatile private var running: Job? = null
    @Volatile private var lastSnapshot: ScreenSnapshot? = null

    init {
        // The Pause switch cancels whatever is running right now.
        AppState.onPauseChanged { paused -> if (paused) running?.cancel(CancellationException("Paused")) }
    }

    /** Runs a tool. Never throws: errors come back as a ToolResult with ok=false. */
    suspend fun execute(context: Context, tool: String, args: JSONObject): ToolResult {
        AppState.init(context)
        if (AppState.paused) return ToolResult.error("Phone Control is PAUSED by the owner. Ask them to resume it in the app.")
        return lock.withLock {
            val job = scope.async { runTool(context.applicationContext, tool, args) }
            running = job
            try {
                job.await()
            } catch (e: CancellationException) {
                ToolResult.error("Stopped: the owner pressed Pause.")
            } catch (e: Exception) {
                ToolResult.error("${e.javaClass.simpleName}: ${e.message}")
            } finally {
                running = null
            }
        }.also { r ->
            AppState.log("${if (r.ok) "OK " else "ERR"} $tool ${argsForLog(tool, args)}" +
                if (!r.ok) " -> ${r.text.take(120)}" else "")
        }
    }

    // ------------------------------------------------------------------------------------------------

    private suspend fun runTool(ctx: Context, tool: String, a: JSONObject): ToolResult {
        // Tools that do not need the Accessibility service.
        when (tool) {
            "list_apps" -> return listApps(ctx)
        }
        val svc = PhoneControlService.instance
            ?: return ToolResult.error("Accessibility service is OFF. Owner must enable it: Settings > Accessibility > Phone Control.")

        return when (tool) {
            "open_app" -> openApp(ctx, svc, a.getString("package"))
            "read_screen" -> readScreen(svc)
            "tap" -> tapElement(svc, a.getInt("element_id"))
            "tap_xy" -> tapXY(svc, a.getDouble("x").toFloat(), a.getDouble("y").toFloat())
            "type_text" -> typeText(svc, a.getInt("element_id"), a.getString("text"), a.optBoolean("submit", false))
            "scroll" -> scroll(svc, a.getString("direction"))
            "swipe" -> {
                checkFront(svc)?.let { return it }
                svc.swipe(
                    a.getDouble("x1").toFloat(), a.getDouble("y1").toFloat(),
                    a.getDouble("x2").toFloat(), a.getDouble("y2").toFloat(),
                    a.optLong("duration_ms", 350),
                )
                afterAction(svc, "Swiped.")
            }
            "press_back" -> { svc.performGlobalAction(AccessibilityService.GLOBAL_ACTION_BACK); afterAction(svc, "Pressed Back.") }
            "press_home" -> { svc.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME); afterAction(svc, "Pressed Home.") }
            "wait" -> {
                val ms = a.optLong("ms", 1000).coerceIn(0, 10_000)
                delay(ms)
                afterAction(svc, "Waited $ms ms.")
            }
            "screenshot" -> screenshot(svc)
            else -> ToolResult.error("Unknown tool '$tool'.")
        }
    }

    // ---------------------------------------------------------------- apps

    private fun listApps(ctx: Context): ToolResult {
        val pm = ctx.packageManager
        val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        val apps = pm.queryIntentActivities(intent, 0)
            .map { it.loadLabel(pm).toString() to it.activityInfo.packageName }
            .distinctBy { it.second }
            .sortedBy { it.first.lowercase() }
        val text = buildString {
            append("Installed apps (name - package). Apps marked BLOCKED cannot be used.\n")
            apps.forEach { (name, pkg) ->
                append(name).append(" - ").append(pkg)
                if (SafetyPolicy.isBlockedPackage(pkg)) append("  [BLOCKED]")
                append('\n')
            }
        }
        return ToolResult(true, text)
    }

    private suspend fun openApp(ctx: Context, svc: PhoneControlService, pkg: String): ToolResult {
        if (SafetyPolicy.isBlockedPackage(pkg)) return blocked(pkg)
        val launch = ctx.packageManager.getLaunchIntentForPackage(pkg)
            ?: return ToolResult.error("App '$pkg' is not installed or has no launcher screen. Use list_apps to get the right package.")
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
        svc.startActivity(launch)
        delay(800) // apps take a moment to show their first screen
        return afterAction(svc, "Opened $pkg.", minWait = 700)
    }

    // ---------------------------------------------------------------- reading

    /** Returns an error result if the front app is blocked, else null. */
    private fun checkFront(svc: PhoneControlService): ToolResult? {
        val pkg = svc.activeRoot()?.packageName?.toString() ?: svc.foregroundPackage
        return if (SafetyPolicy.isBlockedPackage(pkg)) blocked(pkg!!) else null
    }

    private fun blocked(pkg: String) = ToolResult.error(
        "'$pkg' is a banking / UPI / payment / password app. It is blocked: I will not read or touch it. " +
            "The owner must do this part themselves."
    )

    private fun snapshot(svc: PhoneControlService): Pair<ScreenSnapshot?, ToolResult?> {
        val root = svc.activeRoot() ?: return null to ToolResult.error("Cannot read the screen right now (no window). Try wait.")
        val pkg = root.packageName?.toString()
        if (SafetyPolicy.isBlockedPackage(pkg)) return null to blocked(pkg!!)
        val size = svc.screenSize()
        val snap = ScreenReader.read(root, size.x, size.y)
        lastSnapshot = snap
        return snap to null
    }

    private fun appLabel(svc: PhoneControlService, pkg: String): String? = try {
        val pm = svc.packageManager
        pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
    } catch (e: Exception) { null }

    private fun readScreen(svc: PhoneControlService): ToolResult {
        val (snap, err) = snapshot(svc)
        if (err != null) return err
        return ToolResult(true, snap!!.toText(appLabel(svc, snap.packageName)))
    }

    /** After every action: wait for the screen to settle and return the new screen, so Claude needs fewer calls. */
    private suspend fun afterAction(svc: PhoneControlService, what: String, minWait: Long = 350): ToolResult {
        svc.waitForIdle(minMs = minWait)
        val (snap, err) = snapshot(svc)
        if (err != null) return ToolResult(true, "$what\nBut now: ${err.text}")
        return ToolResult(true, "$what\n--- new screen ---\n" + snap!!.toText(appLabel(svc, snap.packageName)))
    }

    private fun element(id: Int): ScreenElement? = lastSnapshot?.find(id)

    // ---------------------------------------------------------------- tapping

    private suspend fun tapElement(svc: PhoneControlService, id: Int): ToolResult {
        checkFront(svc)?.let { return it }
        val el = element(id) ?: return ToolResult.error("No element #$id. Call read_screen first and use an id from the latest screen.")
        if (!confirmIfRisky(svc, el.label, "tap \"${el.label}\"")) {
            return ToolResult.error("The owner did not allow tapping \"${el.label}\" (denied, paused or no answer in 60 s).")
        }
        // 1) Ask the element (or its nearest clickable parent) to click itself. 2) Fall back to a real finger tap.
        var node: AccessibilityNodeInfo? = el.node
        var clicked = false
        var hops = 0
        while (node != null && hops < 5) {
            if (node.isClickable && node.refresh() && node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) { clicked = true; break }
            node = node.parent
            hops++
        }
        if (!clicked) {
            if (!svc.tapAt(el.bounds.exactCenterX(), el.bounds.exactCenterY())) {
                return ToolResult.error("Tap on #$id was cancelled by the system.")
            }
        }
        return afterAction(svc, "Tapped #$id \"${el.label}\".")
    }

    private suspend fun tapXY(svc: PhoneControlService, x: Float, y: Float): ToolResult {
        checkFront(svc)?.let { return it }
        // Find what is under the finger, so the risky-button check also works for coordinate taps.
        val under = lastSnapshot?.elements
            ?.filter { it.bounds.contains(x.toInt(), y.toInt()) }
            ?.minByOrNull { it.bounds.width().toLong() * it.bounds.height() }
        val label = under?.label ?: ""
        if (!confirmIfRisky(svc, label, "tap at ($x, $y) on \"$label\"")) {
            return ToolResult.error("The owner did not allow this tap on \"$label\".")
        }
        if (!svc.tapAt(x, y)) return ToolResult.error("Tap was cancelled by the system.")
        return afterAction(svc, "Tapped at (${x.toInt()}, ${y.toInt()})" + if (label.isNotEmpty()) " on \"$label\"." else ".")
    }

    /** Shows the confirm pop-up for risky buttons. Returns true if the tap may go ahead. */
    private suspend fun confirmIfRisky(svc: PhoneControlService, label: String, description: String): Boolean {
        if (!SafetyPolicy.isRiskyLabel(label)) return true
        AppState.log("Asking you to confirm: $description")
        val ok = svc.askConfirm(description)
        AppState.log(if (ok) "You ALLOWED: $description" else "Not allowed: $description")
        return ok
    }

    // ---------------------------------------------------------------- typing

    private suspend fun typeText(svc: PhoneControlService, id: Int, text: String, submit: Boolean): ToolResult {
        checkFront(svc)?.let { return it }
        val el = element(id) ?: return ToolResult.error("No element #$id. Call read_screen first.")
        if (!el.editable) return ToolResult.error("#$id is not a text field. Pick an element marked 'edit'.")
        val fieldInfo = listOf(el.hint, el.desc, el.viewId, el.text).filter { it.isNotBlank() }.joinToString(" / ")
        SafetyPolicy.secretTextReason(text, fieldInfo, el.password)?.let { return ToolResult.error(it) }

        val node = el.node
        node.refresh()
        node.performAction(AccessibilityNodeInfo.ACTION_FOCUS)
        node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        val args = Bundle().apply {
            putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
        }
        if (!node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)) {
            return ToolResult.error("Could not type into #$id. Try tapping it first.")
        }
        var note = "Typed \"$text\" into #$id."
        if (submit) {
            if (Build.VERSION.SDK_INT >= 30) {
                svc.waitForIdle(minMs = 200, maxMs = 1500)
                val ok = node.performAction(android.view.accessibility.AccessibilityNodeInfo.AccessibilityAction.ACTION_IME_ENTER.id)
                note += if (ok) " Pressed Enter/Search." else " (Enter key not supported here: tap the search button or a suggestion.)"
            } else {
                note += " (Enter key needs Android 11+: tap the search button or a suggestion.)"
            }
        }
        return afterAction(svc, note)
    }

    // ---------------------------------------------------------------- scrolling

    /** direction = which way the CONTENT should move into view: "down" shows what is further down the page. */
    private suspend fun scroll(svc: PhoneControlService, direction: String): ToolResult {
        checkFront(svc)?.let { return it }
        val s = svc.screenSize()
        val cx = s.x / 2f
        val cy = s.y / 2f
        val dy = s.y * 0.30f
        val dx = s.x * 0.35f
        val ok = when (direction.lowercase()) {
            "down" -> svc.swipe(cx, cy + dy, cx, cy - dy, 400)
            "up" -> svc.swipe(cx, cy - dy, cx, cy + dy, 400)
            "right" -> svc.swipe(cx + dx, cy, cx - dx, cy, 300)
            "left" -> svc.swipe(cx - dx, cy, cx + dx, cy, 300)
            else -> return ToolResult.error("direction must be up, down, left or right.")
        }
        if (!ok) return ToolResult.error("Scroll gesture was cancelled by the system.")
        return afterAction(svc, "Scrolled $direction.")
    }

    // ---------------------------------------------------------------- screenshot

    private suspend fun screenshot(svc: PhoneControlService): ToolResult {
        checkFront(svc)?.let { return it }
        val r = svc.screenshotJpegBase64()
        return r.fold(
            onSuccess = { ToolResult(true, "Screenshot of the current screen (scaled down).", it) },
            onFailure = { ToolResult.error(it.message ?: "Screenshot failed.") },
        )
    }

    // ---------------------------------------------------------------- log helper

    /** Short args for the log; long text is cut so the log stays readable. */
    private fun argsForLog(tool: String, a: JSONObject): String =
        if (a.length() == 0) "" else a.toString().take(100)
}
