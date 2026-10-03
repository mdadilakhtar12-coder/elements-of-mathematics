package com.elementsofmathematics.app.data

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

enum class PdfMode { NORMAL, HIGHLIGHTER }

/** A highlighter stroke. Points are stored relative to page size (0..1) so they survive zoom. */
data class HighlightStroke(val page: Int, val color: Long, val points: List<Pair<Float, Float>>)

/** Per-device data: reading preferences, bookmarks, highlights and last-read page. */
object LocalStore {
    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        prefs = context.getSharedPreferences("local_store", Context.MODE_PRIVATE)
    }

    var pdfMode: PdfMode
        get() = runCatching { PdfMode.valueOf(prefs.getString("pdf_mode", null)!!) }.getOrDefault(PdfMode.NORMAL)
        set(value) = prefs.edit().putString("pdf_mode", value.name).apply()

    var nightMode: Boolean
        get() = prefs.getBoolean("night_mode", false)
        set(value) = prefs.edit().putBoolean("night_mode", value).apply()

    fun bookmarks(docKey: String): Set<Int> =
        prefs.getStringSet("bm_$docKey", emptySet()).orEmpty().mapNotNull { it.toIntOrNull() }.toSet()

    fun setBookmarks(docKey: String, pages: Set<Int>) =
        prefs.edit().putStringSet("bm_$docKey", pages.map { it.toString() }.toSet()).apply()

    fun lastPage(docKey: String): Int = prefs.getInt("last_$docKey", 0)

    fun setLastPage(docKey: String, page: Int) = prefs.edit().putInt("last_$docKey", page).apply()

    fun highlights(docKey: String): List<HighlightStroke> {
        val raw = prefs.getString("hl_$docKey", null) ?: return emptyList()
        return runCatching {
            val arr = JSONArray(raw)
            List(arr.length()) { i ->
                val o = arr.getJSONObject(i)
                val pts = o.getJSONArray("p")
                HighlightStroke(
                    page = o.getInt("page"),
                    color = o.getLong("c"),
                    points = List(pts.length() / 2) { j ->
                        pts.getDouble(j * 2).toFloat() to pts.getDouble(j * 2 + 1).toFloat()
                    },
                )
            }
        }.getOrDefault(emptyList())
    }

    fun setHighlights(docKey: String, strokes: List<HighlightStroke>) {
        val arr = JSONArray()
        strokes.forEach { s ->
            val pts = JSONArray()
            s.points.forEach { (x, y) -> pts.put(x.toDouble()); pts.put(y.toDouble()) }
            arr.put(JSONObject().put("page", s.page).put("c", s.color).put("p", pts))
        }
        prefs.edit().putString("hl_$docKey", arr.toString()).apply()
    }
}
