package com.aspirescience.academy.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Indigo = Color(0xFF4338CA)
val IndigoLight = Color(0xFFE6E6FB)
val Amber = Color(0xFFF59E0B)
val Green = Color(0xFF16A34A)
val Orange = Color(0xFFEA580C)
val Red = Color(0xFFDC2626)
val Blue = Color(0xFF2563EB)
val Grey = Color(0xFF6B7280)
val Bg = Color(0xFFF5F6FA)

private val Scheme = lightColorScheme(
    primary = Indigo,
    onPrimary = Color.White,
    primaryContainer = IndigoLight,
    onPrimaryContainer = Color(0xFF1E1B6E),
    secondary = Amber,
    background = Bg,
    surface = Color.White,
    surfaceVariant = Color(0xFFF0F1F7),
    error = Red
)

@Composable
fun AspireTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = Scheme, content = content)
}
