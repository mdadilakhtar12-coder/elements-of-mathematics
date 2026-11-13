package app.phonecontrol

import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.text.InputType
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat

/**
 * Home screen: Accessibility status, the big Pause switch, your own blocklist, and the action log.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var status: TextView
    private lateinit var pauseSwitch: SwitchCompat
    private lateinit var logView: TextView

    private val logListener: () -> Unit = { runOnUiThread { refreshLog() } }
    private val pauseListener: (Boolean) -> Unit = { p -> runOnUiThread { if (pauseSwitch.isChecked != p) pauseSwitch.isChecked = p } }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AppState.init(this)

        val col = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(12), dp(16), dp(24))
        }

        // --- Accessibility status
        status = label("", 16f, bold = true)
        col.add(status, 0)
        col.add(button("1. Open Accessibility settings (turn ON \"Phone Control\")") {
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
        })
        col.add(label(
            "Switch greyed out / \"Restricted setting\"? Tap the button below, then the 3-dot menu (top right) > " +
                "\"Allow restricted settings\", then try step 1 again.", 13f))
        col.add(button("App info (to allow restricted settings)") {
            startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName")))
        })

        // --- Pause switch
        pauseSwitch = SwitchCompat(this).apply {
            text = "PAUSE all actions"
            textSize = 22f
            isChecked = AppState.paused
            setOnCheckedChangeListener { _, checked -> if (checked != AppState.paused) AppState.setPaused(checked) }
        }
        col.add(pauseSwitch, 20)
        col.add(label("When ON, Claude cannot do anything on this phone. A running action stops immediately.", 13f))

        // --- Debug screen
        col.add(button("Debug / local test (Phase 1)") { startActivity(Intent(this, DebugActivity::class.java)) }, 20)

        // --- Your own extra blocklist
        col.add(label("Extra blocked apps (package names, comma separated). Banks, UPI, payment and password apps are already blocked.", 13f), 20)
        val blockedEdit = EditText(this).apply {
            setText(AppState.extraBlocked.joinToString(", "))
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
            hint = "e.g. com.example.mybank"
        }
        col.add(blockedEdit)
        col.add(button("Save blocklist") {
            AppState.extraBlocked = blockedEdit.text.split(',').map { it.trim() }.filter { it.isNotEmpty() }.toSet()
            Toast.makeText(this, "Saved", Toast.LENGTH_SHORT).show()
        })

        // --- Action log
        col.add(label("Action log (newest first)", 16f, bold = true), 20)
        col.add(button("Clear log") { AppState.clearLog() })
        logView = TextView(this).apply {
            textSize = 12f
            typeface = android.graphics.Typeface.MONOSPACE
            setTextIsSelectable(true)
        }
        col.add(logView)

        setContentView(ScrollView(this).apply { addView(col) })
    }

    override fun onResume() {
        super.onResume()
        val on = PhoneControlService.instance != null
        status.text = if (on) "Accessibility: ON" else "Accessibility: OFF (step 1 below)"
        status.setTextColor(if (on) Color.parseColor("#1B8A3A") else Color.parseColor("#C62828"))
        pauseSwitch.isChecked = AppState.paused
        AppState.onLogChanged(logListener)
        AppState.onPauseChanged(pauseListener)
        refreshLog()
    }

    override fun onPause() {
        AppState.removeLogListener(logListener)
        AppState.removePauseListener(pauseListener)
        super.onPause()
    }

    private fun refreshLog() {
        logView.text = AppState.logSnapshot().joinToString("\n").ifEmpty { "(nothing yet)" }
    }
}
