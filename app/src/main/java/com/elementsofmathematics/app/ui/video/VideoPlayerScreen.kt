package com.elementsofmathematics.app.ui.video

import android.app.Activity
import android.content.pm.ActivityInfo
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.elementsofmathematics.app.ui.MainViewModel
import com.elementsofmathematics.app.ui.common.InnerTopBar
import com.elementsofmathematics.app.ui.common.StatusBarIcons
import com.elementsofmathematics.app.ui.common.YouTubeLogo
import com.elementsofmathematics.app.ui.theme.YouTubeRed
import com.elementsofmathematics.app.util.Links
import com.elementsofmathematics.app.util.YouTube
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.FullscreenListener
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.options.IFramePlayerOptions
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView

@Composable
fun VideoPlayerScreen(vm: MainViewModel, sectionId: String, initialItemId: String, onBack: () -> Unit) {
    val items by remember(sectionId) { vm.items(sectionId) }.collectAsStateWithLifecycle()
    var currentId by rememberSaveable { mutableStateOf(initialItemId) }
    val current = items?.firstOrNull { it.id == currentId }
    val videoId = current?.let { YouTube.videoId(it.url) }
    val context = LocalContext.current
    val activity = context as? Activity
    val lifecycleOwner = LocalLifecycleOwner.current

    var player by remember { mutableStateOf<YouTubePlayer?>(null) }
    var fullscreenView by remember { mutableStateOf<View?>(null) }
    var exitFullscreen by remember { mutableStateOf<(() -> Unit)?>(null) }

    val playerView = remember {
        YouTubePlayerView(context).apply {
            enableAutomaticInitialization = false
            addFullscreenListener(object : FullscreenListener {
                override fun onEnterFullscreen(fullscreenView: View, exitFullscreen: () -> Unit) {
                    (fullscreenView.parent as? ViewGroup)?.removeView(fullscreenView)
                    fullscreenViewState(fullscreenView, exitFullscreen)
                }

                override fun onExitFullscreen() = fullscreenViewState(null, null)

                private fun fullscreenViewState(view: View?, exit: (() -> Unit)?) {
                    if (view == null) {
                        fullscreenView?.let { (it.parent as? ViewGroup)?.removeView(it) }
                    }
                    fullscreenView = view
                    exitFullscreen = exit
                }
            })
            val options = IFramePlayerOptions.Builder(context)
                .controls(1)
                .fullscreen(1)
                .rel(0)
                .build()
            initialize(object : AbstractYouTubePlayerListener() {
                override fun onReady(youTubePlayer: YouTubePlayer) {
                    player = youTubePlayer
                }
            }, options)
        }
    }

    DisposableEffect(lifecycleOwner) {
        lifecycleOwner.lifecycle.addObserver(playerView)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(playerView)
            playerView.release()
        }
    }

    LaunchedEffect(player, videoId) {
        val p = player ?: return@LaunchedEffect
        if (videoId != null) p.loadVideo(videoId, 0f)
    }

    // Landscape + hidden system bars while the player is fullscreen.
    val isFullscreen = fullscreenView != null
    DisposableEffect(isFullscreen) {
        val window = activity?.window
        if (isFullscreen && window != null) {
            activity?.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
            WindowCompat.getInsetsController(window, window.decorView).apply {
                systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                hide(WindowInsetsCompat.Type.systemBars())
            }
        }
        onDispose {
            if (isFullscreen && window != null) {
                activity?.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
                WindowCompat.getInsetsController(window, window.decorView).show(WindowInsetsCompat.Type.systemBars())
            }
        }
    }
    BackHandler(enabled = isFullscreen) { exitFullscreen?.invoke() }
    StatusBarIcons(dark = false)

    Box(Modifier.fillMaxSize()) {
        Scaffold(topBar = { InnerTopBar(current?.title ?: "Video", onBack) }) { padding ->
            Column(
                Modifier
                    .fillMaxSize()
                    .padding(padding),
            ) {
                // Kept outside the list so the player stays on top while browsing more videos.
                AndroidView(
                    factory = { playerView.also { (it.parent as? ViewGroup)?.removeView(it) } },
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(16 / 9f)
                        .background(Color.Black),
                )
                LazyColumn(
                    Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentPadding = PaddingValues(bottom = 24.dp),
                ) {
                    item {
                        Column(Modifier.padding(16.dp)) {
                            Text(current?.title ?: "", fontSize = 19.sp, fontWeight = FontWeight.SemiBold)
                            if (current != null && videoId == null) {
                                Text("This video link is not valid.", color = Color(0xFFD32F2F))
                            }
                            Spacer(Modifier.size(12.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Button(
                                    enabled = videoId != null,
                                    onClick = {
                                        player?.pause()
                                        Links.open(context, YouTube.watchUrl(videoId!!))
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = YouTubeRed),
                                ) {
                                    YouTubeLogo(20.dp)
                                    Spacer(Modifier.width(8.dp))
                                    Text("Watch on YouTube")
                                }
                                OutlinedButton(
                                    enabled = videoId != null,
                                    onClick = {
                                        val send = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                                            type = "text/plain"
                                            putExtra(android.content.Intent.EXTRA_TEXT, "${current?.title}\n${YouTube.watchUrl(videoId!!)}")
                                        }
                                        context.startActivity(android.content.Intent.createChooser(send, "Share video"))
                                    },
                                ) {
                                    Icon(Icons.Default.Share, null, modifier = Modifier.size(18.dp))
                                    Spacer(Modifier.width(6.dp))
                                    Text("Share")
                                }
                            }
                        }
                    }
                    val others = items.orEmpty().filter { it.id != currentId }
                    if (others.isNotEmpty()) {
                        item {
                            Text(
                                "More videos",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                            )
                        }
                    }
                    items(others, key = { it.id }) { item ->
                        val id = YouTube.videoId(item.url)
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .clickable { currentId = item.id }
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Box(
                                Modifier
                                    .width(140.dp)
                                    .aspectRatio(16 / 9f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFFEEEEEE)),
                                contentAlignment = Alignment.Center,
                            ) {
                                if (id != null) {
                                    AsyncImage(
                                        model = YouTube.thumbnail(id),
                                        contentDescription = null,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize(),
                                    )
                                }
                                YouTubeLogo(28.dp)
                            }
                            Spacer(Modifier.width(12.dp))
                            Text(
                                item.title,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium,
                                maxLines = 3,
                                overflow = TextOverflow.Ellipsis,
                            )
                        }
                    }
                }
            }
        }

        fullscreenView?.let { view ->
            key(view) {
            AndroidView(
                factory = { ctx ->
                    FrameLayout(ctx).apply {
                        setBackgroundColor(android.graphics.Color.BLACK)
                        (view.parent as? ViewGroup)?.removeView(view)
                        addView(view, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
                    }
                },
                modifier = Modifier.fillMaxSize(),
            )
            }
        }
    }
}

