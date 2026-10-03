package com.elementsofmathematics.app.util

object YouTube {
    private val patterns = listOf(
        Regex("""youtu\.be/([A-Za-z0-9_-]{11})"""),
        Regex("""[?&]v=([A-Za-z0-9_-]{11})"""),
        Regex("""youtube\.com/(?:embed|shorts|live|v)/([A-Za-z0-9_-]{11})"""),
    )
    private val bareId = Regex("""^[A-Za-z0-9_-]{11}$""")

    /** Extracts the video id from any common YouTube link (or a bare id). */
    fun videoId(link: String): String? {
        val text = link.trim()
        if (bareId.matches(text)) return text
        return patterns.firstNotNullOfOrNull { it.find(text)?.groupValues?.get(1) }
    }

    fun thumbnail(id: String) = "https://img.youtube.com/vi/$id/hqdefault.jpg"

    fun watchUrl(id: String) = "https://www.youtube.com/watch?v=$id"
}
