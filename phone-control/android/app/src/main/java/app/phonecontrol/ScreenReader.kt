package app.phonecontrol

import android.graphics.Rect
import android.view.accessibility.AccessibilityNodeInfo

/** One visible thing on the screen that Claude can see and use. */
class ScreenElement(
    val id: Int,
    val node: AccessibilityNodeInfo,
    val type: String,
    val text: String,
    val desc: String,
    val hint: String,
    val viewId: String,
    val bounds: Rect,
    val clickable: Boolean,
    val editable: Boolean,
    val scrollable: Boolean,
    val checked: Boolean?,
    val password: Boolean,
) {
    /** The best human-readable name for this element (used for logs and risky-button checks). */
    val label: String get() = listOf(text, desc, hint).firstOrNull { it.isNotBlank() } ?: viewId

    /** One compact line, for example: `#12 Button "Add to cart" [40,2100,1040,2240] click` */
    fun toLine(): String = buildString {
        append('#').append(id).append(' ').append(type)
        if (text.isNotBlank()) append(" \"").append(text).append('"')
        if (desc.isNotBlank() && desc != text) append(" desc=\"").append(desc).append('"')
        if (hint.isNotBlank() && hint != text) append(" hint=\"").append(hint).append('"')
        append(" [").append(bounds.left).append(',').append(bounds.top).append(',')
            .append(bounds.right).append(',').append(bounds.bottom).append(']')
        if (clickable) append(" click")
        if (editable) append(" edit")
        if (scrollable) append(" scroll")
        if (checked != null) append(if (checked) " checked" else " unchecked")
        if (password) append(" password")
    }
}

/** A "photo" of the screen as a list of elements. Element ids are only valid for this snapshot. */
class ScreenSnapshot(
    val packageName: String,
    val elements: List<ScreenElement>,
    val screenWidth: Int,
    val screenHeight: Int,
    val truncated: Boolean,
) {
    fun find(id: Int): ScreenElement? = elements.firstOrNull { it.id == id }

    /** Compact text that is sent to Claude. */
    fun toText(appLabel: String?): String = buildString {
        append("app: ").append(packageName)
        if (!appLabel.isNullOrBlank()) append(" (").append(appLabel).append(')')
        append("  screen: ").append(screenWidth).append('x').append(screenHeight).append('\n')
        if (elements.isEmpty()) append("(no readable elements - try wait, scroll, or screenshot)\n")
        elements.forEach { append(it.toLine()).append('\n') }
        if (truncated) append("(list cut short - scroll to see more)\n")
    }
}

/**
 * Walks the accessibility tree of the current app window and keeps only useful, visible nodes.
 * Output is kept small on purpose: invisible nodes and empty layout containers are skipped.
 */
object ScreenReader {
    private const val MAX_ELEMENTS = 160
    private const val MAX_TEXT = 80

    fun read(root: AccessibilityNodeInfo, screenWidth: Int, screenHeight: Int): ScreenSnapshot {
        val out = ArrayList<ScreenElement>()
        var truncated = false
        val screen = Rect(0, 0, screenWidth, screenHeight)

        fun visit(node: AccessibilityNodeInfo, depth: Int) {
            if (out.size >= MAX_ELEMENTS) { truncated = true; return }
            if (depth > 60) return
            if (!node.isVisibleToUser) return

            val bounds = Rect().also { node.getBoundsInScreen(it) }
            if (bounds.width() <= 0 || bounds.height() <= 0 || !Rect.intersects(bounds, screen)) return

            val text = clean(node.text)
            val desc = clean(node.contentDescription)
            val hint = if (android.os.Build.VERSION.SDK_INT >= 26) clean(node.hintText) else ""
            val clickable = node.isClickable || node.isLongClickable
            val editable = node.isEditable
            val scrollable = node.isScrollable
            val checkable = node.isCheckable

            val interesting = text.isNotEmpty() || desc.isNotEmpty() || editable || scrollable || checkable || clickable
            if (interesting) {
                // For a clickable box with no text (common for cards), borrow the text of its children.
                val shownText = if (text.isEmpty() && desc.isEmpty() && clickable) childText(node) else text
                if (shownText.isNotEmpty() || desc.isNotEmpty() || hint.isNotEmpty() || editable || scrollable || checkable ||
                    (clickable && node.viewIdResourceName != null)
                ) {
                    out += ScreenElement(
                        id = out.size + 1,
                        node = node,
                        type = shortType(node.className?.toString(), editable, scrollable),
                        text = if (node.isPassword) "" else shownText, // never show what is in a password field
                        desc = desc,
                        hint = hint,
                        viewId = node.viewIdResourceName?.substringAfter(":id/") ?: "",
                        bounds = bounds,
                        clickable = clickable,
                        editable = editable,
                        scrollable = scrollable,
                        checked = if (checkable) node.isChecked else null,
                        password = node.isPassword,
                    )
                }
            }
            for (i in 0 until node.childCount) {
                val child = node.getChild(i) ?: continue
                visit(child, depth + 1)
            }
        }

        visit(root, 0)
        return ScreenSnapshot(root.packageName?.toString() ?: "?", out, screenWidth, screenHeight, truncated)
    }

    /** First few texts inside a node, joined (used to name clickable cards). */
    private fun childText(node: AccessibilityNodeInfo): String {
        val parts = ArrayList<String>()
        fun walk(n: AccessibilityNodeInfo, depth: Int) {
            if (parts.size >= 3 || depth > 6) return
            for (i in 0 until n.childCount) {
                val c = n.getChild(i) ?: continue
                if (!c.isVisibleToUser) continue
                val t = clean(c.text).ifEmpty { clean(c.contentDescription) }
                if (t.isNotEmpty()) parts += t
                walk(c, depth + 1)
                if (parts.size >= 3) return
            }
        }
        walk(node, 0)
        return parts.joinToString(" | ").take(MAX_TEXT)
    }

    private fun clean(cs: CharSequence?): String =
        cs?.toString()?.replace('\n', ' ')?.replace('"', '\'')?.trim()?.take(MAX_TEXT) ?: ""

    private fun shortType(className: String?, editable: Boolean, scrollable: Boolean): String {
        if (editable) return "EditText"
        val simple = className?.substringAfterLast('.') ?: "View"
        return when {
            simple.contains("Button", true) -> "Button"
            simple.contains("CheckBox", true) -> "CheckBox"
            simple.contains("Switch", true) -> "Switch"
            simple.contains("Image", true) -> "Image"
            simple.contains("Text", true) -> "Text"
            scrollable || simple.contains("Recycler", true) || simple.contains("Scroll", true) ||
                simple.contains("List", true) -> "List"
            else -> simple
        }
    }
}
