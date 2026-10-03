package com.elementsofmathematics.app.data

import com.elementsofmathematics.app.AppConfig

data class AppSettings(
    val appTitle: String = AppConfig.DEFAULT_TITLE,
    /** Seconds between automatic banner slides. 0 turns auto-slide off. */
    val bannerIntervalSec: Int = 4,
    val feedbackEmail: String = AppConfig.DEFAULT_FEEDBACK_EMAIL,
    val moreApps: List<MoreApp> = emptyList(),
)

data class MoreApp(val title: String, val url: String)

data class Banner(
    val id: String = "",
    val imageUrl: String = "",
    val storagePath: String = "",
    val linkUrl: String = "",
    val order: Long = 0,
)

enum class SectionType(val key: String, val label: String) {
    PDF("pdf", "PDF documents"),
    VIDEO("video", "YouTube videos");

    companion object {
        fun from(key: String?) = entries.firstOrNull { it.key == key } ?: PDF
    }
}

data class Section(
    val id: String = "",
    val title: String = "",
    val icon: String = "📚",
    val type: SectionType = SectionType.PDF,
    val order: Long = 0,
)

/** A chapter PDF or a video, depending on the section's type. */
data class ContentItem(
    val id: String = "",
    val title: String = "",
    /** PDF download link, or YouTube link for video sections. */
    val url: String = "",
    /** Firebase Storage path when the PDF was uploaded from the app. */
    val storagePath: String = "",
    val order: Long = 0,
)

/** Special icon key that renders a YouTube logo instead of an emoji. */
const val ICON_YOUTUBE = "youtube"

val SECTION_ICONS = listOf(
    "📚", "📖", "📗", "📘", "📝", "✍️", "📒", "📓", "📄", "📑", "📋", "🗒️",
    "🧮", "📐", "📏", "➗", "🔢", "🧠", "💡", "🎯", "🏆", "⭐", "🎮", "🧩",
    ICON_YOUTUBE, "🎬", "▶️", "🎧",
)

val DEFAULT_SECTIONS = listOf(
    Section(title = "NCERT Book", icon = "📚", type = SectionType.PDF),
    Section(title = "NCERT Solutions", icon = "📑", type = SectionType.PDF),
    Section(title = "Handwritten Notes", icon = "✍️", type = SectionType.PDF),
    Section(title = "Revision Notes", icon = "📒", type = SectionType.PDF),
    Section(title = "Sample Papers", icon = "📝", type = SectionType.PDF),
    Section(title = "Video Lectures", icon = ICON_YOUTUBE, type = SectionType.VIDEO),
)
