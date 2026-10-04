package com.elementsofmathematics.app.ui.section

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.elementsofmathematics.app.data.ContentItem
import com.elementsofmathematics.app.data.PdfCache
import com.elementsofmathematics.app.data.Repository
import com.elementsofmathematics.app.data.SectionType
import com.elementsofmathematics.app.ui.MainViewModel
import com.elementsofmathematics.app.ui.admin.ConfirmDialog
import com.elementsofmathematics.app.ui.admin.ItemEditorDialog
import com.elementsofmathematics.app.ui.admin.addLabel
import com.elementsofmathematics.app.ui.common.InnerTopBar
import com.elementsofmathematics.app.ui.common.NumberBubble
import com.elementsofmathematics.app.ui.common.StatusBarIcons
import com.elementsofmathematics.app.ui.common.YouTubeLogo
import com.elementsofmathematics.app.ui.home.AdminItemMenu
import com.elementsofmathematics.app.ui.theme.DoneGreen
import com.elementsofmathematics.app.ui.theme.DownloadOrange
import com.elementsofmathematics.app.ui.theme.Purple
import com.elementsofmathematics.app.util.Links
import com.elementsofmathematics.app.util.YouTube
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

@Composable
fun SectionScreen(
    vm: MainViewModel,
    sectionId: String,
    onBack: () -> Unit,
    onOpenPdf: (path: String, title: String, key: String) -> Unit,
    onOpenVideo: (itemId: String) -> Unit,
) {
    val sections by vm.sections.collectAsStateWithLifecycle()
    val section = sections?.firstOrNull { it.id == sectionId }
    val items by remember(sectionId) { vm.items(sectionId) }.collectAsStateWithLifecycle()
    val isAdmin by vm.isAdmin.collectAsStateWithLifecycle()
    val loadErrors by vm.loadErrors.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    var editing by remember { mutableStateOf<ContentItem?>(null) }
    var deleting by remember { mutableStateOf<ContentItem?>(null) }
    var removingDownload by remember { mutableStateOf<ContentItem?>(null) }
    var downloadProgress by remember { mutableStateOf<Float?>(null) }
    var downloading by remember { mutableStateOf(false) }
    var downloadJob by remember { mutableStateOf<Job?>(null) }
    // Bumped after a download/delete so the check marks refresh.
    var cacheVersion by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) { vm.messages.collect { snackbar.showSnackbar(it) } }
    StatusBarIcons(dark = false)

    val type = section?.type ?: SectionType.PDF

    fun openPdf(item: ContentItem) {
        if (downloading) return
        val file = PdfCache.fileFor(context, item)
        if (PdfCache.isDownloaded(context, item)) {
            onOpenPdf(file.path, item.title, item.id)
            return
        }
        downloading = true
        downloadProgress = null
        downloadJob = scope.launch {
            try {
                val f = PdfCache.download(context, item) { downloadProgress = it }
                cacheVersion++
                onOpenPdf(f.path, item.title, item.id)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                snackbar.showSnackbar("Download failed: ${e.localizedMessage ?: "check your internet"}")
            } finally {
                downloading = false
            }
        }
    }

    Scaffold(
        topBar = { InnerTopBar(section?.title ?: "", onBack) },
        snackbarHost = { SnackbarHost(snackbar) },
        floatingActionButton = {
            if (isAdmin && section != null) {
                ExtendedFloatingActionButton(
                    onClick = { editing = ContentItem() },
                    icon = { Icon(Icons.Default.Add, null) },
                    text = { Text(addLabel(type)) },
                    containerColor = Purple,
                    contentColor = Color.White,
                )
            }
        },
    ) { padding ->
        val list = items
        Box(
            Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
            when {
                loadErrors["content"] != null -> Text(
                    loadErrors.getValue("content"),
                    color = Color(0xFFD32F2F),
                    modifier = Modifier.align(Alignment.Center).padding(32.dp),
                )
                list == null -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                list.isEmpty() -> Text(
                    if (isAdmin) "Nothing here yet. Tap the + button to add." else "Content is coming soon!",
                    color = Color.Gray,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(32.dp),
                )

                type == SectionType.VIDEO -> LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(12.dp, 12.dp, 12.dp, 96.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    itemsIndexed(list, key = { _, it -> it.id }) { index, item ->
                        VideoCard(
                            item = item,
                            isAdmin = isAdmin,
                            onClick = { onOpenVideo(item.id) },
                            onEdit = { editing = item },
                            onDelete = { deleting = item },
                            onMove = { delta ->
                                vm.move(list, index, delta, { Repository.itemPath(sectionId, it.id) }, { it.order })
                            },
                        )
                    }
                }

                else -> LazyColumn(
                    contentPadding = PaddingValues(12.dp, 12.dp, 12.dp, 96.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    itemsIndexed(list, key = { _, it -> it.id }) { index, item ->
                        val isLink = type == SectionType.LINK
                        val downloaded = remember(item.id, item.url, cacheVersion) { !isLink && PdfCache.isDownloaded(context, item) }
                        ChapterRow(
                            number = index + 1,
                            item = item,
                            downloaded = downloaded,
                            isLink = isLink,
                            isAdmin = isAdmin,
                            onClick = { if (isLink) Links.open(context, item.url) else openPdf(item) },
                            onLongClick = { if (downloaded) removingDownload = item },
                            onEdit = { editing = item },
                            onDelete = { deleting = item },
                            onMove = { delta ->
                                vm.move(list, index, delta, { Repository.itemPath(sectionId, it.id) }, { it.order })
                            },
                        )
                    }
                }
            }
        }
    }

    if (downloading) {
        AlertDialog(
            onDismissRequest = {},
            properties = DialogProperties(dismissOnClickOutside = false, dismissOnBackPress = false),
            title = { Text("Downloading…") },
            text = {
                Column {
                    val p = downloadProgress
                    if (p == null) LinearProgressIndicator(Modifier.fillMaxWidth())
                    else LinearProgressIndicator(progress = { p }, modifier = Modifier.fillMaxWidth())
                    Spacer(Modifier.height(12.dp))
                    Text(
                        if (p == null) "Please wait" else "${(p * 100).toInt()}%",
                        modifier = Modifier.align(Alignment.CenterHorizontally),
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    downloadJob?.cancel()
                    downloading = false
                }) { Text("CANCEL") }
            },
        )
    }

    editing?.let { item ->
        ItemEditorDialog(
            type = type,
            item = item,
            onDismiss = { editing = null },
            onSave = { updated, oldPath ->
                editing = null
                vm.run("Saved") {
                    Repository.saveItem(sectionId, updated, vm.nextOrder(items) { it.order })
                    if (!oldPath.isNullOrEmpty() && oldPath != updated.storagePath) Repository.deleteStorageFile(oldPath)
                }
            },
        )
    }
    deleting?.let { item ->
        ConfirmDialog(
            title = "Delete \"${item.title}\"?",
            message = "It will be removed for all students.",
            onDismiss = { deleting = null },
            onConfirm = {
                deleting = null
                vm.run("Deleted") { Repository.deleteItem(sectionId, item) }
            },
        )
    }
    removingDownload?.let { item ->
        AlertDialog(
            onDismissRequest = { removingDownload = null },
            title = { Text("Remove download?") },
            text = { Text("\"${item.title}\" will be removed from this phone. You can download it again anytime.") },
            confirmButton = {
                TextButton(onClick = {
                    PdfCache.delete(context, item)
                    cacheVersion++
                    removingDownload = null
                }) { Text("Remove") }
            },
            dismissButton = { TextButton(onClick = { removingDownload = null }) { Text("Cancel") } },
        )
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ChapterRow(
    number: Int,
    item: ContentItem,
    downloaded: Boolean,
    isLink: Boolean,
    isAdmin: Boolean,
    onClick: () -> Unit,
    onLongClick: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onMove: (Int) -> Unit,
) {
    var menu by remember { mutableStateOf(false) }
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
        modifier = Modifier
            .fillMaxWidth()
            .combinedClickable(onClick = onClick, onLongClick = onLongClick),
    ) {
        Row(
            Modifier.padding(horizontal = 12.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            NumberBubble(number)
            Spacer(Modifier.width(14.dp))
            Text(
                item.title,
                fontSize = 17.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF1E1E1E),
                modifier = Modifier.weight(1f),
            )
            if (isLink) {
                Icon(Icons.AutoMirrored.Filled.OpenInNew, "Open", tint = Purple, modifier = Modifier.size(28.dp))
            } else if (downloaded) {
                Box(
                    Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(DoneGreen),
                    contentAlignment = Alignment.Center,
                ) { Icon(Icons.Default.Check, "Downloaded", tint = Color.White, modifier = Modifier.size(22.dp)) }
            } else {
                Box(
                    Modifier
                        .size(32.dp)
                        .border(2.dp, DownloadOrange, CircleShape),
                    contentAlignment = Alignment.Center,
                ) { Icon(Icons.Default.Download, "Download", tint = DownloadOrange, modifier = Modifier.size(20.dp)) }
            }
            if (isAdmin) {
                Box {
                    IconButton(onClick = { menu = true }) { Icon(Icons.Default.MoreVert, "Options", tint = Color.Gray) }
                    AdminItemMenu(menu, { menu = false }, onEdit, onDelete, { onMove(-1) }, { onMove(1) })
                }
            }
        }
    }
}

@Composable
private fun VideoCard(
    item: ContentItem,
    isAdmin: Boolean,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onMove: (Int) -> Unit,
) {
    var menu by remember { mutableStateOf(false) }
    val id = YouTube.videoId(item.url)
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
    ) {
        Box {
            Column {
                Box(
                    Modifier
                        .fillMaxWidth()
                        .aspectRatio(16 / 9f)
                        .background(Color(0xFFF1F1F1)),
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
                    YouTubeLogo(44.dp)
                }
                Text(
                    item.title,
                    textAlign = TextAlign.Center,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    maxLines = 2,
                    minLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(10.dp),
                )
            }
            if (isAdmin) {
                Box(Modifier.align(Alignment.TopEnd)) {
                    IconButton(onClick = { menu = true }) {
                        Icon(
                            Icons.Default.MoreVert, "Options", tint = Color.White,
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(Color.Black.copy(alpha = 0.4f)),
                        )
                    }
                    AdminItemMenu(menu, { menu = false }, onEdit, onDelete, { onMove(-1) }, { onMove(1) })
                }
            }
        }
    }
}
