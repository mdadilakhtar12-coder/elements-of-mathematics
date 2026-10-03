package com.elementsofmathematics.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Purple = Color(0xFF9C27B0)
val PurpleLight = Color(0xFFC06AE8)
val PurpleDark = Color(0xFF7B1FA2)
val ScreenBg = Color(0xFFF6F6F8)
val DownloadOrange = Color(0xFFF57C00)
val DoneGreen = Color(0xFF16B13A)
val YouTubeRed = Color(0xFFE60000)

/** Colors for the numbered chapter bubbles, cycled by chapter number. */
val BubbleGradients = listOf(
    listOf(Color(0xFFF06BD8), Color(0xFFB620E0)),
    listOf(Color(0xFFFF8A9A), Color(0xFFE3264E)),
    listOf(Color(0xFF6A5CFF), Color(0xFF2E7BF6)),
    listOf(Color(0xFFFFD24C), Color(0xFFF59E0B)),
    listOf(Color(0xFF8BE04A), Color(0xFF1FAA4A)),
    listOf(Color(0xFF4BE3C0), Color(0xFF1693B8)),
    listOf(Color(0xFFFFB347), Color(0xFFFF7A00)),
)

private val Colors = lightColorScheme(
    primary = Purple,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFF3E5F5),
    onPrimaryContainer = PurpleDark,
    secondary = PurpleLight,
    background = ScreenBg,
    surface = Color.White,
)

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = Colors, content = content)
}
