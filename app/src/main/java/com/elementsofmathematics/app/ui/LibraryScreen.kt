package com.elementsofmathematics.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.elementsofmathematics.app.data.*
import com.elementsofmathematics.app.ui.common.InnerTopBar
import com.elementsofmathematics.app.ui.common.StatusBarIcons
import com.elementsofmathematics.app.util.Links
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.util.Locale

@Composable
fun SearchScreen(vm: MainViewModel, onBack: () -> Unit,
                 onPdf: (String, String, String) -> Unit, onVideo: (String, String) -> Unit,
                 onSection: (String) -> Unit) {
    val catalog by vm.library.collectAsStateWithLifecycle()
    val sections by vm.sections.collectAsStateWithLifecycle()
    val errors by vm.loadErrors.collectAsStateWithLifecycle()
    var query by rememberSaveable { mutableStateOf("") }
    val results = remember(catalog.items, query) { LibrarySearch.filter(catalog.items, query) }
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    var downloading by remember { mutableStateOf(false) }
    var progress by remember { mutableStateOf<Float?>(null) }
    var job by remember { mutableStateOf<Job?>(null) }
    StatusBarIcons(dark = false)
    Scaffold(topBar = { InnerTopBar("Search", onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            OutlinedTextField(query, { query = it }, label = { Text("Search chapters, PDFs and videos") },
                leadingIcon = { Icon(Icons.Default.Search, null) }, singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(12.dp))
            LazyColumn(contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                if (catalog.loading) item { LinearProgressIndicator(Modifier.fillMaxWidth()) }
                if (errors.isNotEmpty()) item { Text("Some content could not load. Showing available results. Check your connection.", color = MaterialTheme.colorScheme.error) }
                if (query.isBlank()) {
                    item { Text("Browse sections or search by title.") }
                    items(sections.orEmpty(), key = { it.id }) { section ->
                        Card(onClick = { onSection(section.id) }, modifier = Modifier.fillMaxWidth()) {
                            Text(section.title, Modifier.padding(16.dp))
                        }
                    }
                } else {
                    if (results.isEmpty() && !catalog.loading) item { Text("No matching content found.") }
                    items(results, key = { it.key }) { row ->
                        Card(onClick = {
                            when (row.section.type) {
                                SectionType.VIDEO -> onVideo(row.section.id, row.item.id)
                                SectionType.LINK -> Links.open(context, row.item.url)
                                SectionType.PDF -> if (!downloading) {
                                    if (PdfCache.isDownloaded(context, row.item)) onPdf(PdfCache.fileFor(context, row.item).path, row.item.title, row.item.id)
                                    else {
                                        downloading = true; progress = null
                                        job = scope.launch {
                                            try {
                                                val file = PdfCache.download(context, row.item) { progress = it }
                                                onPdf(file.path, row.item.title, row.item.id)
                                            } catch (e: CancellationException) { throw e
                                            } catch (e: Exception) { snackbar.showSnackbar(e.localizedMessage ?: "Could not download PDF") }
                                            finally { downloading = false }
                                        }
                                    }
                                }
                            }
                        }, modifier = Modifier.fillMaxWidth()) {
                            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(row.item.title, style = MaterialTheme.typography.titleMedium)
                                Text("${row.section.title} · ${row.section.type.label}", style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }
        }
    }
    if (downloading) AlertDialog(
        onDismissRequest = {}, properties = DialogProperties(dismissOnBackPress = false, dismissOnClickOutside = false),
        title = { Text("Downloading PDF") }, text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                val p = progress
                if (p == null) LinearProgressIndicator(Modifier.fillMaxWidth())
                else LinearProgressIndicator(progress = { p }, modifier = Modifier.fillMaxWidth())
                Text(if (p == null) "Please wait…" else "${(p * 100).toInt()}%")
            }
        }, confirmButton = { TextButton(onClick = { job?.cancel() }) { Text("Cancel") } },
    )
}

@Composable
fun DownloadsScreen(onBack: () -> Unit, onPdf: (String, String, String) -> Unit) {
    val context = LocalContext.current
    var downloads by remember { mutableStateOf(PdfCache.downloads(context)) }
    var removing by remember { mutableStateOf<DownloadEntry?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    StatusBarIcons(dark = false)
    Scaffold(topBar = { InnerTopBar("Downloads", onBack) }) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            item { Text("Saved PDFs can be read offline. They stay protected inside this app.") }
            if (downloads.isEmpty()) item { Text("No downloaded PDFs yet. Open a PDF from a section to save it here.", Modifier.padding(vertical = 24.dp)) }
            error?.let { message -> item { Text(message, color = MaterialTheme.colorScheme.error) } }
            items(downloads, key = { it.fileName }) { entry ->
                Card(onClick = {
                    val file = PdfCache.downloadFile(context, entry)
                    if (file.isFile) onPdf(file.path, entry.title, entry.docKey)
                    else { downloads = PdfCache.downloads(context); error = "This download is missing. Open the PDF from its section again." }
                }, modifier = Modifier.fillMaxWidth()) {
                    Row(Modifier.padding(16.dp)) {
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(entry.title, style = MaterialTheme.typography.titleMedium)
                            val size = PdfCache.downloadFile(context, entry).length() / (1024.0 * 1024.0)
                            Text("${entry.sectionTitle} · ${String.format(Locale.US, "%.1f MB", size)}", style = MaterialTheme.typography.bodySmall)
                        }
                        IconButton(onClick = { removing = entry }) { Icon(Icons.Default.DeleteOutline, "Remove download") }
                    }
                }
            }
        }
    }
    removing?.let { entry ->
        AlertDialog(onDismissRequest = { removing = null }, title = { Text("Remove download?") },
            text = { Text("Remove \"${entry.title}\" from this phone? The original PDF and your bookmarks will stay saved.") },
            confirmButton = { TextButton(onClick = {
                runCatching { PdfCache.removeDownload(context, entry) }.onFailure { error = it.localizedMessage }
                downloads = PdfCache.downloads(context); removing = null
            }) { Text("Remove") } }, dismissButton = { TextButton(onClick = { removing = null }) { Text("Cancel") } })
    }
}
