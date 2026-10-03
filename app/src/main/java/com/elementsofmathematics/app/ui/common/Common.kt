package com.elementsofmathematics.app.ui.common

import android.app.Activity
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import com.elementsofmathematics.app.data.ICON_YOUTUBE
import com.elementsofmathematics.app.ui.theme.BubbleGradients
import com.elementsofmathematics.app.ui.theme.PurpleLight
import com.elementsofmathematics.app.ui.theme.YouTubeRed

/** Light purple bar used on inner screens. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InnerTopBar(title: String, onBack: () -> Unit, actions: @Composable () -> Unit = {}) {
    TopAppBar(
        title = { Text(title, maxLines = 1, overflow = TextOverflow.Ellipsis, fontWeight = FontWeight.SemiBold) },
        navigationIcon = {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") }
        },
        actions = { actions() },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = PurpleLight,
            titleContentColor = Color.White,
            navigationIconContentColor = Color.White,
            actionIconContentColor = Color.White,
        ),
    )
}

/** Draws a YouTube-style red play button. */
@Composable
fun YouTubeLogo(size: Dp, modifier: Modifier = Modifier) {
    Canvas(modifier.size(size, size * 0.72f)) {
        drawRoundRect(
            color = YouTubeRed,
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(this.size.height * 0.28f),
        )
        val w = this.size.width
        val h = this.size.height
        val path = Path().apply {
            moveTo(w * 0.40f, h * 0.30f)
            lineTo(w * 0.40f, h * 0.70f)
            lineTo(w * 0.66f, h * 0.50f)
            close()
        }
        drawPath(path, Color.White)
    }
}

/** Shows an emoji icon, or the YouTube logo for the special "youtube" key. */
@Composable
fun SectionIcon(icon: String, size: Dp) {
    if (icon == ICON_YOUTUBE) {
        Box(Modifier.size(size), contentAlignment = Alignment.Center) { YouTubeLogo(size * 0.95f) }
    } else {
        Box(Modifier.size(size), contentAlignment = Alignment.Center) {
            Text(icon, fontSize = (size.value * 0.78f).sp)
        }
    }
}

/** Colorful numbered bubble shown before each chapter. */
@Composable
fun NumberBubble(number: Int, size: Dp = 52.dp) {
    val colors = BubbleGradients[(number - 1).mod(BubbleGradients.size)]
    Box(Modifier.size(size + 6.dp)) {
        Box(
            Modifier
                .size(size)
                .align(Alignment.Center)
                .shadow(4.dp, CircleShape)
                .clip(RoundedCornerShape(topStartPercent = 50, topEndPercent = 45, bottomEndPercent = 50, bottomStartPercent = 40))
                .background(Brush.linearGradient(colors, start = Offset.Zero, end = Offset.Infinite)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                number.toString(),
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = if (number >= 10) 17.sp else 20.sp,
            )
        }
        Box(
            Modifier
                .size(size * 0.24f)
                .align(Alignment.TopStart)
                .clip(CircleShape)
                .background(colors.first()),
        )
    }
}

/** Sets status bar icon color (dark icons on light bars, light icons on purple bars). */
@Composable
fun StatusBarIcons(dark: Boolean) {
    val view = LocalView.current
    if (view.isInEditMode) return
    DisposableEffect(dark) {
        val window = (view.context as? Activity)?.window
        val controller = window?.let { WindowCompat.getInsetsController(it, view) }
        val previous = controller?.isAppearanceLightStatusBars
        controller?.isAppearanceLightStatusBars = dark
        onDispose { if (previous != null) controller.isAppearanceLightStatusBars = previous }
    }
}
