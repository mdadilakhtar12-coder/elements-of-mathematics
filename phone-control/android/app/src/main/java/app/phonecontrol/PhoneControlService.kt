package app.phonecontrol

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.Path
import android.graphics.PixelFormat
import android.graphics.Point
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Base64
import android.view.Display
import android.view.Gravity
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import kotlinx.coroutines.delay
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeoutOrNull
import java.io.ByteArrayOutputStream
import kotlin.coroutines.resume

/**
 * The Accessibility service. Android starts it when you switch it on in
 * Settings > Accessibility > Phone Control. It can read the screen and do taps/gestures.
 *
 * It does NOT decide anything by itself: [CommandExecutor] tells it what to do,
 * after the safety checks in [SafetyPolicy].
 */
class PhoneControlService : AccessibilityService() {

    companion object {
        /** The running service, or null when Accessibility is switched off. */
        @Volatile var instance: PhoneControlService? = null
            private set
    }

    private val main = Handler(Looper.getMainLooper())

    /** Time of the last screen-change event; used to wait until the screen has settled after an action. */
    @Volatile private var lastEventAt = 0L

    /** Package of the app that is currently in front. */
    @Volatile var foregroundPackage: String? = null
        private set

    override fun onServiceConnected() {
        super.onServiceConnected()
        AppState.init(this)
        instance = this
        AppState.log("Accessibility service ON")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return
        lastEventAt = SystemClock.uptimeMillis()
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val pkg = event.packageName?.toString()
            // Ignore our own confirm pop-up and the keyboard / system UI when tracking the "front" app.
            if (pkg != null && pkg != packageName && pkg != "com.android.systemui" && !pkg.contains("inputmethod")) {
                foregroundPackage = pkg
            }
        }
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        instance = null
        AppState.log("Accessibility service OFF")
        super.onDestroy()
    }

    // ---------------------------------------------------------------- reading

    fun screenSize(): Point {
        val wm = getSystemService(WINDOW_SERVICE) as WindowManager
        return if (Build.VERSION.SDK_INT >= 30) {
            val b = wm.currentWindowMetrics.bounds
            Point(b.width(), b.height())
        } else {
            @Suppress("DEPRECATION")
            Point().also { wm.defaultDisplay.getRealSize(it) }
        }
    }

    /** The root of the app window that is in front (not our own pop-up). */
    fun activeRoot(): AccessibilityNodeInfo? {
        val root = rootInActiveWindow
        if (root != null && root.packageName?.toString() != packageName) return root
        // Our confirm pop-up or the keyboard may be "active": pick the app window behind it.
        return windows.asSequence()
            .filter { it.type == android.view.accessibility.AccessibilityWindowInfo.TYPE_APPLICATION }
            .mapNotNull { it.root }
            .firstOrNull { it.packageName?.toString() != packageName }
            ?: root
    }

    /** Waits until the screen has stopped changing (or [maxMs] passed). */
    suspend fun waitForIdle(minMs: Long = 350, quietMs: Long = 450, maxMs: Long = 4000) {
        val start = SystemClock.uptimeMillis()
        delay(minMs)
        while (SystemClock.uptimeMillis() - start < maxMs) {
            if (SystemClock.uptimeMillis() - lastEventAt >= quietMs) return
            delay(100)
        }
    }

    // ---------------------------------------------------------------- gestures

    /** Performs a gesture and waits until Android says it finished. Returns false if it was cancelled. */
    private suspend fun gesture(path: Path, durationMs: Long): Boolean = suspendCancellableCoroutine { cont ->
        val g = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, durationMs.coerceIn(1, 5000)))
            .build()
        val ok = dispatchGesture(g, object : GestureResultCallback() {
            override fun onCompleted(d: GestureDescription?) { if (cont.isActive) cont.resume(true) }
            override fun onCancelled(d: GestureDescription?) { if (cont.isActive) cont.resume(false) }
        }, main)
        if (!ok && cont.isActive) cont.resume(false)
    }

    suspend fun tapAt(x: Float, y: Float): Boolean =
        gesture(Path().apply { moveTo(x, y) }, 60)

    suspend fun swipe(x1: Float, y1: Float, x2: Float, y2: Float, durationMs: Long = 350): Boolean =
        gesture(Path().apply { moveTo(x1, y1); lineTo(x2, y2) }, durationMs)

    // ---------------------------------------------------------------- screenshot (Android 11+)

    /**
     * Takes a screenshot and returns it as a small JPEG in base64.
     * Secure screens (FLAG_SECURE, e.g. banking/payment pages) cannot be captured: we return an error, no tricks.
     */
    suspend fun screenshotJpegBase64(maxWidth: Int = 720, quality: Int = 60): Result<String> {
        if (Build.VERSION.SDK_INT < 30) return Result.failure(Exception("Screenshot needs Android 11 or newer."))
        return suspendCancellableCoroutine { cont ->
            takeScreenshot(Display.DEFAULT_DISPLAY, mainExecutor, object : TakeScreenshotCallback {
                override fun onSuccess(shot: ScreenshotResult) {
                    try {
                        val hw = Bitmap.wrapHardwareBuffer(shot.hardwareBuffer, shot.colorSpace)
                        shot.hardwareBuffer.close()
                        if (hw == null) { cont.resume(Result.failure(Exception("Could not read screenshot."))); return }
                        val soft = hw.copy(Bitmap.Config.ARGB_8888, false)
                        hw.recycle()
                        val scale = minOf(1f, maxWidth.toFloat() / soft.width)
                        val small = Bitmap.createScaledBitmap(soft, (soft.width * scale).toInt(), (soft.height * scale).toInt(), true)
                        val bytes = ByteArrayOutputStream().also { small.compress(Bitmap.CompressFormat.JPEG, quality, it) }.toByteArray()
                        cont.resume(Result.success(Base64.encodeToString(bytes, Base64.NO_WRAP)))
                    } catch (e: Exception) {
                        cont.resume(Result.failure(e))
                    }
                }

                override fun onFailure(errorCode: Int) {
                    val why = when (errorCode) {
                        ERROR_TAKE_SCREENSHOT_SECURE_WINDOW -> "This screen is protected (secure screen). I do not capture it."
                        ERROR_TAKE_SCREENSHOT_INTERVAL_TIME_SHORT -> "Too many screenshots, wait a second and try again."
                        else -> "Screenshot failed (code $errorCode)."
                    }
                    cont.resume(Result.failure(Exception(why)))
                }
            })
        }
    }

    // ---------------------------------------------------------------- confirm pop-up

    /**
     * Shows a pop-up on the phone ("Claude wants to tap 'Place order'. Allow?") and waits for your tap.
     * Returns true only if you tap Allow. Timeout, Deny, or the Pause switch all mean "no".
     */
    suspend fun askConfirm(message: String, timeoutMs: Long = 60_000): Boolean {
        // 0 = waiting, 1 = allowed, 2 = denied. Atomic because buttons run on another thread.
        val decided = java.util.concurrent.atomic.AtomicInteger(0)
        val view = java.util.concurrent.atomic.AtomicReference<LinearLayout?>(null)
        val wm = getSystemService(WINDOW_SERVICE) as WindowManager

        main.post {
            val pad = (16 * resources.displayMetrics.density).toInt()
            val box = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.parseColor("#F2202124"))
                setPadding(pad, pad, pad, pad)
            }
            box.addView(TextView(this).apply {
                text = "Claude wants to do this:\n\n$message\n\nAllow?"
                setTextColor(Color.WHITE)
                textSize = 17f
            })
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.END }
            row.addView(Button(this).apply { text = "Deny"; setOnClickListener { decided.set(2) } })
            row.addView(Button(this).apply { text = "Allow"; setOnClickListener { decided.set(1) } })
            box.addView(row)
            val lp = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                PixelFormat.TRANSLUCENT,
            ).apply { gravity = Gravity.BOTTOM }
            try { wm.addView(box, lp); view.set(box) } catch (e: Exception) { decided.set(2) }
        }

        try {
            val result = withTimeoutOrNull(timeoutMs) {
                while (decided.get() == 0 && !AppState.paused) delay(100)
                decided.get() == 1 && !AppState.paused
            } ?: false
            return result
        } finally {
            // Always remove the pop-up, also when the action is cancelled by the Pause switch.
            main.post { view.get()?.let { runCatching { wm.removeView(it) } } }
            Thread.sleep(250) // let the pop-up disappear before we tap underneath it
        }
    }
}
