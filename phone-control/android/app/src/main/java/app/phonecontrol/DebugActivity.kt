package app.phonecontrol

import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Bundle
import android.text.InputType
import android.util.Base64
import android.widget.CheckBox
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONObject

/**
 * Phase 1 test screen. Runs any tool locally (no server needed):
 *  1. Pick a tool (buttons fill the boxes), press "Run after 5 s".
 *  2. Within 5 seconds switch to the app you want to test (e.g. Flipkart).
 *  3. The tool runs there, and this screen comes back with the result.
 */
class DebugActivity : AppCompatActivity() {

    private lateinit var toolEdit: EditText
    private lateinit var argsEdit: EditText
    private lateinit var delayEdit: EditText
    private lateinit var comeBack: CheckBox
    private lateinit var output: TextView
    private lateinit var image: ImageView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val col = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(12), dp(16), dp(24))
        }

        col.add(label("How to test: choose a tool, press Run, then within the delay switch to the app to test. " +
            "The result shows here. Element ids come from the LAST read_screen.", 13f), 0)

        // Quick-fill buttons
        val presets = listOf(
            "read_screen" to "{}",
            "tap" to "{\"element_id\": 1}",
            "type_text" to "{\"element_id\": 1, \"text\": \"shoes\", \"submit\": true}",
            "scroll" to "{\"direction\": \"down\"}",
            "open_app" to "{\"package\": \"com.flipkart.android\"}",
            "list_apps" to "{}",
            "press_back" to "{}",
            "screenshot" to "{}",
        )
        val grid = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        presets.chunked(2).forEach { pair ->
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            pair.forEach { (tool, args) ->
                row.addView(button(tool) { toolEdit.setText(tool); argsEdit.setText(args) },
                    LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
            }
            grid.addView(row)
        }
        col.add(grid)

        toolEdit = EditText(this).apply { hint = "tool name"; setText("read_screen"); inputType = InputType.TYPE_CLASS_TEXT }
        argsEdit = EditText(this).apply { hint = "arguments (JSON)"; setText("{}") }
        delayEdit = EditText(this).apply { hint = "delay seconds"; setText("5"); inputType = InputType.TYPE_CLASS_NUMBER }
        comeBack = CheckBox(this).apply { text = "Come back to this screen after running"; isChecked = true }
        col.add(label("Tool", 13f)); col.add(toolEdit, 0)
        col.add(label("Arguments (JSON)", 13f)); col.add(argsEdit, 0)
        col.add(label("Delay before running (seconds)", 13f)); col.add(delayEdit, 0)
        col.add(comeBack)
        col.add(button("Run after delay") { run() }, 12)
        col.add(button("Run now (on this screen)") { run(forceNow = true) })

        output = TextView(this).apply {
            textSize = 12f
            typeface = android.graphics.Typeface.MONOSPACE
            setTextIsSelectable(true)
        }
        image = ImageView(this).apply { adjustViewBounds = true }
        col.add(output, 16)
        col.add(image)

        setContentView(ScrollView(this).apply { addView(col) })
    }

    private fun run(forceNow: Boolean = false) {
        val tool = toolEdit.text.toString().trim()
        val args = try {
            JSONObject(argsEdit.text.toString().ifBlank { "{}" })
        } catch (e: Exception) {
            output.text = "Arguments are not valid JSON: ${e.message}"
            return
        }
        val delaySec = if (forceNow) 0 else delayEdit.text.toString().toIntOrNull()?.coerceIn(0, 60) ?: 5
        output.text = if (delaySec > 0) "Running '$tool' in $delaySec s... switch to the app now." else "Running '$tool'..."
        image.setImageDrawable(null)

        lifecycleScope.launch {
            delay(delaySec * 1000L)
            val result = CommandExecutor.execute(applicationContext, tool, args)
            output.text = result.text
            result.imageJpegBase64?.let {
                val bytes = Base64.decode(it, Base64.DEFAULT)
                image.setImageBitmap(BitmapFactory.decodeByteArray(bytes, 0, bytes.size))
            }
            if (delaySec > 0 && comeBack.isChecked) {
                delay(1500) // so you can see the effect in the other app first
                startActivity(Intent(this@DebugActivity, DebugActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or Intent.FLAG_ACTIVITY_NEW_TASK))
            }
        }
    }
}
