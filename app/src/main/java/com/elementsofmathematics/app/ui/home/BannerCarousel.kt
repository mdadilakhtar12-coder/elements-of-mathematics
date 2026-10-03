package com.elementsofmathematics.app.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.elementsofmathematics.app.data.Banner
import com.elementsofmathematics.app.ui.theme.Purple
import com.elementsofmathematics.app.util.Links
import kotlinx.coroutines.delay

private const val VIRTUAL_PAGES = 10_000

/**
 * Auto-sliding banners. Students can also swipe left/right.
 * The pager is "virtually infinite" so it always slides forward.
 */
@Composable
fun BannerCarousel(
    banners: List<Banner>,
    intervalSec: Int,
    isAdmin: Boolean,
    onManage: () -> Unit,
) {
    if (banners.isEmpty()) {
        if (isAdmin) {
            Box(
                Modifier
                    .fillMaxWidth()
                    .aspectRatio(2.4f)
                    .clip(RoundedCornerShape(16.dp))
                    .border(2.dp, Purple.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                    .clickable(onClick = onManage),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.AddPhotoAlternate, null, tint = Purple, modifier = Modifier.size(36.dp))
                    Text("Add banners", color = Purple)
                }
            }
        }
        return
    }

    val count = banners.size
    val pagerState = rememberPagerState(
        initialPage = if (count > 1) VIRTUAL_PAGES / 2 - (VIRTUAL_PAGES / 2) % count else 0,
        pageCount = { if (count > 1) VIRTUAL_PAGES else 1 },
    )
    val context = LocalContext.current

    // Restarts after every settle, so a manual swipe resets the timer.
    LaunchedEffect(pagerState.settledPage, intervalSec, count) {
        if (count > 1 && intervalSec > 0) {
            delay(intervalSec * 1000L)
            if (!pagerState.isScrollInProgress) pagerState.animateScrollToPage(pagerState.currentPage + 1)
        }
    }

    Column {
        Box {
            HorizontalPager(
                state = pagerState,
                pageSpacing = 12.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(2f),
            ) { page ->
                val banner = banners[page % count]
                AsyncImage(
                    model = banner.imageUrl,
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .shadow(4.dp, RoundedCornerShape(16.dp))
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFFEDE7F6))
                        .clickable(enabled = banner.linkUrl.isNotBlank()) { Links.open(context, banner.linkUrl) },
                )
            }
            if (isAdmin) {
                FilledTonalButton(
                    onClick = onManage,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp),
                ) {
                    Icon(Icons.Default.Edit, null, modifier = Modifier.size(16.dp))
                    Text("  Banners")
                }
            }
        }
        if (count > 1) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalArrangement = Arrangement.Center,
            ) {
                repeat(count) { i ->
                    val selected = pagerState.currentPage % count == i
                    Box(
                        Modifier
                            .padding(horizontal = 3.dp)
                            .size(width = if (selected) 18.dp else 7.dp, height = 7.dp)
                            .clip(CircleShape)
                            .background(if (selected) Purple else Color(0xFFD1C4E9)),
                    )
                }
            }
        }
    }
}
