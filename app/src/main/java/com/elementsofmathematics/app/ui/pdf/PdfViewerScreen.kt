package com.elementsofmathematics.app.ui.pdf

import android.graphics.Bitmap
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.calculateCentroid
import androidx.compose.foundation.gestures.calculatePan
import androidx.compose.foundation.gestures.calculateZoom
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.BorderColor
import androidx.compose.material.icons.filled.CollectionsBookmark
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FindInPage
import androidx.compose.material.icons.filled.LayersClear
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.elementsofmathematics.app.data.HighlightStroke
import com.elementsofmathematics.app.data.LocalStore
import com.elementsofmathematics.app.data.PdfMode
import com.elementsofmathematics.app.ui.common.StatusBarIcons
import com.elementsofmathematics.app.ui.theme.Purple
import kotlinx.coroutines.launch
import kotlinx.coroutines.CancellationException
import java.io.File
import kotlin.math.roundToInt

private const val MAX_ZOOM = 4f
private const val MAX_RENDER_WIDTH = 2048
private const val STROKE_WIDTH = 0.028f

private val HighlightColors = listOf(0x70FFEB3BL, 0x6076FF03L, 0x60FF4081L, 0x6040C4FFL)

private val InvertFilter = ColorFilter.colorMatrix(
    ColorMatrix(
        floatArrayOf(
            -1f, 0f, 0f, 0f, 255f,
            0f, -1f, 0f, 0f, 255f,
            0f, 0f, -1f, 0f, 255f,
            0f, 0f, 0f, 1f, 0f,
        ),
    ),
)

private sealed interface LoadState {
    data object Loading : LoadState
    data class Ready(val doc: PdfDocument) : LoadState
    data class Failed(val message: String) : LoadState
}

@Composable
fun PdfViewerScreen(path: String, title: String, docKey: String, onBack: () -> Unit) {
    val state by produceState<LoadState>(LoadState.Loading, path) {
        value = try {
            LoadState.Ready(PdfDocument.open(File(path)))
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            File(path).delete() // corrupt download: fetch it again next time
            LoadState.Failed("Could not open this PDF. Please go back and download it again.")
        }
    }
    DisposableEffect(state) {
        onDispose { (state as? LoadState.Ready)?.doc?.close() }
    }
    StatusBarIcons(dark = true)

    when (val s = state) {
        LoadState.Loading -> Box(Modifier.fillMaxSize().background(Color.White), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        is LoadState.Failed -> Column(
            Modifier.fillMaxSize().background(Color.White).padding(32.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(s.message)
            Spacer(Modifier.height(16.dp))
            Button(onClick = onBack) { Text("Go back") }
        }
        is LoadState.Ready -> PdfReader(s.doc, title, docKey.ifEmpty { path })
    }
}

@Composable
private fun PdfReader(doc: PdfDocument, title: String, docKey: String) {
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }
    val listState = rememberLazyListState(
        initialFirstVisibleItemIndex = LocalStore.lastPage(docKey).coerceIn(0, (doc.pageCount - 1).coerceAtLeast(0)),
    )
    val hScroll = rememberScrollState()

    var night by remember { mutableStateOf(LocalStore.nightMode) }
    var highlighter by remember { mutableStateOf(LocalStore.pdfMode == PdfMode.HIGHLIGHTER) }
    var highlightColor by remember { mutableStateOf(HighlightColors.first()) }
    var toolbarVisible by remember { mutableStateOf(true) }
    var bookmarks by remember { mutableStateOf(LocalStore.bookmarks(docKey)) }
    var strokes by remember { mutableStateOf(LocalStore.highlights(docKey)) }
    var showBookmarks by remember { mutableStateOf(false) }
    var showGoTo by remember { mutableStateOf(false) }

    var zoom by remember { mutableFloatStateOf(1f) }
    // Zoom used for rendering; updated when a pinch ends so we don't re-render every frame.
    var renderZoom by remember { mutableFloatStateOf(1f) }

    val currentPage by remember {
        derivedStateOf {
            val info = listState.layoutInfo
            val first = info.visibleItemsInfo.firstOrNull() ?: return@derivedStateOf listState.firstVisibleItemIndex
            if (-first.offset > first.size / 2 && info.visibleItemsInfo.size > 1) first.index + 1 else first.index
        }
    }
    LaunchedEffect(currentPage) { LocalStore.setLastPage(docKey, currentPage) }

    fun saveStrokes(new: List<HighlightStroke>) {
        strokes = new
        LocalStore.setHighlights(docKey, new)
    }

    fun goTo(page: Int) = scope.launch { listState.scrollToItem(page.coerceIn(0, doc.pageCount - 1)) }

    /** Applies a zoom change around [focus] (in viewport pixels), keeping that point still. */
    fun applyZoom(newZoomRaw: Float, focus: Offset) {
        val newZoom = newZoomRaw.coerceIn(1f, MAX_ZOOM)
        val factor = newZoom / zoom
        if (factor == 1f) return
        val targetX = (hScroll.value + focus.x) * factor - focus.x
        val firstIndex = listState.firstVisibleItemIndex
        val targetY = (listState.firstVisibleItemScrollOffset + focus.y) * factor - focus.y
        zoom = newZoom
        scope.launch {
            withFrameNanos { } // wait for the new layout so scroll ranges are updated
            hScroll.scrollTo(targetX.roundToInt().coerceAtLeast(0))
            listState.scrollToItem(firstIndex, targetY.roundToInt().coerceAtLeast(0))
        }
    }

    Box(
        Modifier
            .fillMaxSize()
            .background(if (night) Color(0xFF121212) else Color(0xFFE9E9EE)),
    ) {
        Column(Modifier.fillMaxSize()) {
            Box(
                Modifier
                    .fillMaxWidth()
                    .background(if (night) Color(0xFF1E1E1E) else Color.White)
                    .statusBarsPadding(),
            )
            if (toolbarVisible) {
                ReaderToolbar(
                    night = night,
                    highlighter = highlighter,
                    bookmarked = currentPage in bookmarks,
                    onHighlighter = { highlighter = !highlighter },
                    onNight = {
                        night = !night
                        LocalStore.nightMode = night
                    },
                    onBookmark = {
                        val added = currentPage !in bookmarks
                        bookmarks = if (added) bookmarks + currentPage else bookmarks - currentPage
                        LocalStore.setBookmarks(docKey, bookmarks)
                        scope.launch {
                            snackbar.currentSnackbarData?.dismiss()
                            snackbar.showSnackbar(if (added) "Bookmark added" else "Bookmark removed", duration = SnackbarDuration.Short)
                        }
                    },
                    onBookmarks = { showBookmarks = true },
                    onGoTo = { showGoTo = true },
                )
            }

            BoxWithConstraints(
                Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .pointerInput(Unit) {
                        // Two fingers: pinch to zoom and pan. One finger is left to scrolling/highlighting.
                        awaitEachGesture {
                            awaitFirstDown(requireUnconsumed = false, pass = PointerEventPass.Initial)
                            var transformed = false
                            do {
                                val event = awaitPointerEvent(PointerEventPass.Initial)
                                if (event.changes.count { it.pressed } >= 2) {
                                    transformed = true
                                    val z = event.calculateZoom()
                                    val pan = event.calculatePan()
                                    if (z != 1f) applyZoom(zoom * z, event.calculateCentroid(useCurrent = true))
                                    listState.dispatchRawDelta(-pan.y)
                                    hScroll.dispatchRawDelta(-pan.x)
                                    event.changes.forEach { it.consume() }
                                }
                            } while (event.changes.any { it.pressed })
                            if (transformed) renderZoom = zoom
                        }
                    },
            ) {
                val viewportWidthPx = constraints.maxWidth
                val contentWidth = maxWidth * zoom
                val renderWidth = (viewportWidthPx * renderZoom).roundToInt().coerceIn(1, MAX_RENDER_WIDTH)
                Box(
                    Modifier
                        .fillMaxSize()
                        .horizontalScroll(hScroll, enabled = zoom > 1f),
                ) {
                    LazyColumn(
                        state = listState,
                        contentPadding = PaddingValues(vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier
                            .width(contentWidth)
                            .fillMaxHeight(),
                    ) {
                        items(doc.pageCount) { index ->
                            PdfPage(
                                doc = doc,
                                index = index,
                                renderWidth = renderWidth,
                                night = night,
                                strokes = strokes.filter { it.page == index },
                                highlighter = highlighter,
                                highlightColor = highlightColor,
                                onStroke = { saveStrokes(strokes + it) },
                                onTap = { toolbarVisible = !toolbarVisible },
                                onDoubleTap = { focus ->
                                    val target = if (zoom > 1f) 1f else 2f
                                    applyZoom(target, focus)
                                    renderZoom = target
                                },
                            )
                        }
                    }
                }
                PageIndicator(currentPage + 1, doc.pageCount, Modifier.align(Alignment.TopEnd).padding(top = 12.dp))
            }

            if (highlighter) {
                HighlighterBar(
                    night = night,
                    selected = highlightColor,
                    onColor = { highlightColor = it },
                    onUndo = { if (strokes.isNotEmpty()) saveStrokes(strokes.dropLast(1)) },
                    onClearPage = { saveStrokes(strokes.filter { it.page != currentPage }) },
                    onDone = { highlighter = false },
                )
            } else {
                Spacer(Modifier.navigationBarsPadding())
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).navigationBarsPadding().padding(bottom = 56.dp))
    }

    if (showBookmarks) {
        BookmarksDialog(
            title = title,
            pages = bookmarks.sorted(),
            onDismiss = { showBookmarks = false },
            onOpen = {
                showBookmarks = false
                goTo(it)
            },
            onRemove = {
                bookmarks = bookmarks - it
                LocalStore.setBookmarks(docKey, bookmarks)
            },
        )
    }
    if (showGoTo) {
        GoToPageDialog(
            pageCount = doc.pageCount,
            onDismiss = { showGoTo = false },
            onGo = {
                showGoTo = false
                goTo(it - 1)
            },
        )
    }
}

@Composable
private fun PdfPage(
    doc: PdfDocument,
    index: Int,
    renderWidth: Int,
    night: Boolean,
    strokes: List<HighlightStroke>,
    highlighter: Boolean,
    highlightColor: Long,
    onStroke: (HighlightStroke) -> Unit,
    onTap: () -> Unit,
    onDoubleTap: (Offset) -> Unit,
) {
    // Keeps showing the previous bitmap while a sharper one renders after zooming.
    var bitmap by remember(index) { mutableStateOf<Bitmap?>(doc.cached(index, renderWidth)) }
    LaunchedEffect(index, renderWidth) {
        val rendered = doc.render(index, renderWidth)
        if (rendered != null) bitmap = rendered
    }
    var current by remember { mutableStateOf<List<Offset>>(emptyList()) }

    val gestures = if (highlighter) {
        Modifier.pointerInput(highlightColor) {
            fun norm(o: Offset) = Offset(o.x / size.width, o.y / size.height)
            detectDragGestures(
                onDragStart = { current = listOf(norm(it)) },
                onDrag = { change, _ ->
                    change.consume()
                    current = current + norm(change.position)
                },
                onDragEnd = {
                    if (current.size > 1) {
                        onStroke(HighlightStroke(index, highlightColor, current.map { it.x to it.y }))
                    }
                    current = emptyList()
                },
                onDragCancel = { current = emptyList() },
            )
        }
    } else {
        Modifier.pointerInput(Unit) {
            detectTapGestures(onTap = { onTap() }, onDoubleTap = { onDoubleTap(it) })
        }
    }

    Box(
        Modifier
            .fillMaxWidth()
            .aspectRatio(doc.pageRatios[index])
            .background(if (night) Color.Black else Color.White)
            .then(gestures),
    ) {
        val bmp = bitmap
        if (bmp != null) {
            Image(
                bitmap = bmp.asImageBitmap(),
                contentDescription = "Page ${index + 1}",
                contentScale = ContentScale.FillBounds,
                colorFilter = if (night) InvertFilter else null,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            CircularProgressIndicator(Modifier.align(Alignment.Center).size(32.dp))
        }
        Canvas(Modifier.fillMaxSize()) {
            strokes.forEach { drawHighlight(it.points.map { (x, y) -> Offset(x, y) }, Color(it.color)) }
            if (current.size > 1) drawHighlight(current, Color(highlightColor))
        }
    }
}

private fun DrawScope.drawHighlight(points: List<Offset>, color: Color) {
    if (points.size < 2) return
    val path = Path().apply {
        moveTo(points[0].x * size.width, points[0].y * size.height)
        for (i in 1 until points.size) lineTo(points[i].x * size.width, points[i].y * size.height)
    }
    drawPath(
        path,
        color,
        style = Stroke(width = size.width * STROKE_WIDTH, cap = StrokeCap.Square, join = StrokeJoin.Round),
    )
}

@Composable
private fun ReaderToolbar(
    night: Boolean,
    highlighter: Boolean,
    bookmarked: Boolean,
    onHighlighter: () -> Unit,
    onNight: () -> Unit,
    onBookmark: () -> Unit,
    onBookmarks: () -> Unit,
    onGoTo: () -> Unit,
) {
    Surface(color = if (night) Color(0xFF1E1E1E) else Color.White, shadowElevation = 4.dp) {
        Row(
            Modifier
                .fillMaxWidth()
                .height(60.dp)
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            ToolButton(Icons.Default.BorderColor, "Highlighter", Color(0xFFFFB300), active = highlighter, onClick = onHighlighter)
            ToolButton(if (night) Icons.Default.LightMode else Icons.Default.DarkMode, "Night mode", Color(0xFFFFC107), onClick = onNight)
            ToolButton(if (bookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder, "Bookmark", Color(0xFFE53935), onClick = onBookmark)
            ToolButton(Icons.Default.CollectionsBookmark, "Bookmarks", Color(0xFF3949AB), onClick = onBookmarks)
            ToolButton(Icons.Default.FindInPage, "Go to page", Purple, onClick = onGoTo)
        }
    }
}

@Composable
private fun ToolButton(icon: ImageVector, label: String, tint: Color, active: Boolean = false, onClick: () -> Unit) {
    IconButton(
        onClick = onClick,
        modifier = Modifier
            .size(48.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(if (active) tint.copy(alpha = 0.18f) else Color.Transparent),
    ) { Icon(icon, contentDescription = label, tint = tint, modifier = Modifier.size(30.dp)) }
}

@Composable
private fun PageIndicator(page: Int, count: Int, modifier: Modifier) {
    Box(
        modifier
            .clip(RoundedCornerShape(topStart = 50.dp, bottomStart = 50.dp))
            .background(Color(0xE6EEF1F8))
            .padding(horizontal = 16.dp, vertical = 8.dp),
    ) { Text("$page / $count", fontSize = 16.sp, fontWeight = FontWeight.Medium, color = Color(0xFF222222)) }
}

@Composable
private fun HighlighterBar(
    night: Boolean,
    selected: Long,
    onColor: (Long) -> Unit,
    onUndo: () -> Unit,
    onClearPage: () -> Unit,
    onDone: () -> Unit,
) {
    Surface(color = if (night) Color(0xFF1E1E1E) else Color.White, shadowElevation = 8.dp) {
        Column(Modifier.navigationBarsPadding()) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                HighlightColors.forEach { c ->
                    Box(
                        Modifier
                            .padding(4.dp)
                            .size(30.dp)
                            .clip(CircleShape)
                            .background(Color(c or 0xFF000000L))
                            .border(if (c == selected) 3.dp else 0.dp, Color(0xFF333333), CircleShape)
                            .clickable { onColor(c) },
                    )
                }
                Spacer(Modifier.weight(1f))
                IconButton(onClick = onUndo) { Icon(Icons.AutoMirrored.Filled.Undo, "Undo", tint = Color.Gray) }
                IconButton(onClick = onClearPage) { Icon(Icons.Default.LayersClear, "Clear this page", tint = Color.Gray) }
                TextButton(onClick = onDone) { Text("Done") }
            }
            Text(
                "Draw with one finger • Use two fingers to scroll or zoom",
                fontSize = 11.sp,
                color = Color.Gray,
                modifier = Modifier.padding(start = 16.dp, bottom = 6.dp),
            )
        }
    }
}

@Composable
private fun BookmarksDialog(
    title: String,
    pages: List<Int>,
    onDismiss: () -> Unit,
    onOpen: (Int) -> Unit,
    onRemove: (Int) -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Bookmarks") },
        text = {
            if (pages.isEmpty()) {
                Text("No bookmarks yet. Tap the bookmark icon to save the current page.")
            } else {
                LazyColumn(Modifier.heightIn(max = 400.dp)) {
                    items(pages) { page ->
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .clickable { onOpen(page) }
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(Icons.Default.Bookmark, null, tint = Color(0xFFE53935))
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text("Page ${page + 1}", fontWeight = FontWeight.Medium)
                                Text(title, fontSize = 12.sp, color = Color.Gray, maxLines = 1)
                            }
                            IconButton(onClick = { onRemove(page) }) { Icon(Icons.Default.Delete, "Remove", tint = Color.Gray) }
                        }
                        HorizontalDivider()
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Close") } },
    )
}

@Composable
private fun GoToPageDialog(pageCount: Int, onDismiss: () -> Unit, onGo: (Int) -> Unit) {
    var text by remember { mutableStateOf("") }
    val page = text.toIntOrNull()
    val valid = page != null && page in 1..pageCount
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Go to page") },
        text = {
            OutlinedTextField(
                value = text,
                onValueChange = { text = it.filter(Char::isDigit).take(5) },
                label = { Text("Page number (1 – $pageCount)") },
                singleLine = true,
                isError = text.isNotEmpty() && !valid,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            )
        },
        confirmButton = { Button(enabled = valid, onClick = { onGo(page!!) }) { Text("Go") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
