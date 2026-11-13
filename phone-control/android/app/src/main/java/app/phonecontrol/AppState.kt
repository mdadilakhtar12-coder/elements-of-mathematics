package app.phonecontrol

import android.content.Context
import android.content.SharedPreferences
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.CopyOnWriteArrayList

/**
 * Small app-wide state: the Pause switch, the action log, and simple settings.
 * Everything here is safe to call from any thread.
 */
object AppState {
    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        if (::prefs.isInitialized) return
        prefs = context.applicationContext.getSharedPreferences("phone_control", Context.MODE_PRIVATE)
        paused = prefs.getBoolean("paused", false)
        SafetyPolicy.userBlocked = extraBlocked
    }

    // ---------------------------------------------------------------- Pause switch

    /** When true, every action is refused immediately (also the one waiting for a confirm). */
    @Volatile var paused: Boolean = false
        private set

    private val pauseListeners = CopyOnWriteArrayList<(Boolean) -> Unit>()

    fun setPaused(value: Boolean) {
        paused = value
        if (::prefs.isInitialized) prefs.edit().putBoolean("paused", value).apply()
        log(if (value) "PAUSED by you - all actions stopped" else "Resumed by you")
        pauseListeners.forEach { it(value) }
    }

    fun onPauseChanged(listener: (Boolean) -> Unit) { pauseListeners += listener }
    fun removePauseListener(listener: (Boolean) -> Unit) { pauseListeners -= listener }

    // ---------------------------------------------------------------- extra blocked apps

    /** Extra package names you block yourself (comma separated, editable in the app). */
    var extraBlocked: Set<String>
        get() = prefs.getString("extra_blocked", "")!!.split(',').map { it.trim() }.filter { it.isNotEmpty() }.toSet()
        set(value) {
            prefs.edit().putString("extra_blocked", value.joinToString(",")).apply()
            SafetyPolicy.userBlocked = value
        }

    // ---------------------------------------------------------------- action log

    private const val MAX_LOG = 300
    private val logLines = ArrayDeque<String>()
    private val logListeners = CopyOnWriteArrayList<() -> Unit>()
    private val timeFmt = SimpleDateFormat("HH:mm:ss", Locale.US)

    fun log(message: String) {
        val line = "${timeFmt.format(Date())}  $message"
        synchronized(logLines) {
            logLines.addFirst(line)
            while (logLines.size > MAX_LOG) logLines.removeLast()
        }
        android.util.Log.i("PhoneControl", message)
        logListeners.forEach { it() }
    }

    fun logSnapshot(): List<String> = synchronized(logLines) { logLines.toList() }
    fun clearLog() { synchronized(logLines) { logLines.clear() }; logListeners.forEach { it() } }
    fun onLogChanged(listener: () -> Unit) { logListeners += listener }
    fun removeLogListener(listener: () -> Unit) { logListeners -= listener }
}
