package app.phonecontrol

import android.content.Context
import android.graphics.Typeface
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/** Tiny helpers so the screens can be built in Kotlin without XML layout files. */
internal fun Context.dp(v: Int) = (v * resources.displayMetrics.density).toInt()

internal fun LinearLayout.add(view: View, topMarginDp: Int = 8): View {
    val lp = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
    lp.topMargin = context.dp(topMarginDp)
    addView(view, lp)
    return view
}

internal fun Context.label(text: String, sizeSp: Float = 15f, bold: Boolean = false) = TextView(this).apply {
    this.text = text
    textSize = sizeSp
    if (bold) setTypeface(typeface, Typeface.BOLD)
}

internal fun Context.button(text: String, onClick: () -> Unit) = Button(this).apply {
    this.text = text
    isAllCaps = false
    setOnClickListener { onClick() }
}
