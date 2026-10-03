package com.elementsofmathematics.app.ui.admin

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Link
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import com.elementsofmathematics.app.data.AppSettings
import com.elementsofmathematics.app.data.Banner
import com.elementsofmathematics.app.data.Repository
import com.elementsofmathematics.app.ui.MainViewModel
import com.elementsofmathematics.app.ui.common.InnerTopBar
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@Composable
fun BannerManagerDialog(vm: MainViewModel, banners: List<Banner>, settings: AppSettings, onDismiss: () -> Unit) {
    var interval by remember { mutableFloatStateOf(settings.bannerIntervalSec.toFloat()) }
    var showAdd by remember { mutableStateOf(false) }
    var editLinkFor by remember { mutableStateOf<Banner?>(null) }
    var deleting by remember { mutableStateOf<Banner?>(null) }

    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Scaffold(topBar = { InnerTopBar("Manage Banners", onBack = onDismiss) }) { padding ->
            LazyColumn(
                Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                item {
                    Card(colors = CardDefaults.cardColors(containerColor = Color.White)) {
                        Column(Modifier.padding(16.dp)) {
                            Text("Auto-slide time", fontWeight = FontWeight.Bold)
                            val sec = interval.roundToInt()
                            Text(if (sec == 0) "Auto-slide is OFF" else "Next banner every $sec seconds", color = Color.Gray)
                            Slider(value = interval, onValueChange = { interval = it }, valueRange = 0f..15f, steps = 14)
                            Button(
                                enabled = sec != settings.bannerIntervalSec,
                                onClick = { vm.run("Slide time saved") { Repository.saveSettings(settings.copy(bannerIntervalSec = sec)) } },
                            ) { Text("Save time") }
                        }
                    }
                }
                item {
                    Button(onClick = { showAdd = true }, modifier = Modifier.fillMaxWidth()) {
                        Icon(Icons.Default.AddPhotoAlternate, null)
                        Text("  Add Banner")
                    }
                    Text(
                        "Tip: use wide images (2:1), e.g. 1200 × 600 pixels.",
                        fontSize = 12.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
                itemsIndexed(banners, key = { _, b -> b.id }) { index, banner ->
                    Card(colors = CardDefaults.cardColors(containerColor = Color.White)) {
                        AsyncImage(
                            model = banner.imageUrl,
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(2f)
                                .background(Color(0xFFEDE7F6)),
                        )
                        Row(Modifier.padding(horizontal = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                if (banner.linkUrl.isBlank()) "No link" else banner.linkUrl,
                                fontSize = 12.sp,
                                color = Color.Gray,
                                maxLines = 1,
                                modifier = Modifier.weight(1f),
                            )
                            IconButton(onClick = { editLinkFor = banner }) { Icon(Icons.Default.Link, "Link") }
                            IconButton(onClick = {
                                vm.move(banners, index, -1, { Repository.bannerPath(it.id) }, { it.order })
                            }) { Icon(Icons.Default.ArrowUpward, "Move up") }
                            IconButton(onClick = {
                                vm.move(banners, index, 1, { Repository.bannerPath(it.id) }, { it.order })
                            }) { Icon(Icons.Default.ArrowDownward, "Move down") }
                            IconButton(onClick = { deleting = banner }) {
                                Icon(Icons.Default.Delete, "Delete", tint = Color(0xFFD32F2F))
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAdd) {
        AddBannerDialog(
            onDismiss = { showAdd = false },
            onSave = { banner ->
                showAdd = false
                vm.run("Banner added") { Repository.saveBanner(banner, vm.nextOrder(banners) { it.order }) }
            },
        )
    }
    editLinkFor?.let { banner ->
        var link by remember(banner.id) { mutableStateOf(banner.linkUrl) }
        AlertDialog(
            onDismissRequest = { editLinkFor = null },
            title = { Text("Banner link") },
            text = {
                OutlinedTextField(
                    link, { link = it },
                    label = { Text("Opens when tapped (optional)") },
                    singleLine = true,
                )
            },
            confirmButton = {
                Button(onClick = {
                    editLinkFor = null
                    vm.run("Link saved") { Repository.saveBanner(banner.copy(linkUrl = link.trim()), 0) }
                }) { Text("Save") }
            },
            dismissButton = { TextButton(onClick = { editLinkFor = null }) { Text("Cancel") } },
        )
    }
    deleting?.let { banner ->
        ConfirmDialog(
            title = "Delete banner?",
            message = "This banner will be removed for all students.",
            onDismiss = { deleting = null },
            onConfirm = {
                deleting = null
                vm.run("Banner deleted") { Repository.deleteBanner(banner) }
            },
        )
    }
}

@Composable
private fun AddBannerDialog(onDismiss: () -> Unit, onSave: (Banner) -> Unit) {
    val scope = rememberCoroutineScope()
    var picked by remember { mutableStateOf<Uri?>(null) }
    var imageUrl by remember { mutableStateOf("") }
    var link by remember { mutableStateOf("") }
    var progress by remember { mutableStateOf<Float?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) {
            picked = uri
            imageUrl = ""
        }
    }

    AlertDialog(
        onDismissRequest = { if (progress == null) onDismiss() },
        title = { Text("Add Banner") },
        text = {
            Column {
                OutlinedButton(
                    onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                    modifier = Modifier.fillMaxWidth(),
                ) { Text(if (picked == null) "Choose image from phone" else "Change image") }
                val preview: Any? = picked ?: imageUrl.takeIf { it.isNotBlank() }
                if (preview != null) {
                    Spacer(Modifier.height(8.dp))
                    AsyncImage(
                        model = preview,
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .fillMaxWidth()
                            .aspectRatio(2f)
                            .clip(RoundedCornerShape(12.dp)),
                    )
                }
                Text("— or —", color = Color.Gray, modifier = Modifier.align(Alignment.CenterHorizontally).padding(6.dp))
                OutlinedTextField(
                    imageUrl,
                    { imageUrl = it; if (it.isNotBlank()) picked = null },
                    label = { Text("Image link") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    link, { link = it },
                    label = { Text("Open link on tap (optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                progress?.let {
                    Spacer(Modifier.height(8.dp))
                    LinearProgressIndicator(progress = { it }, modifier = Modifier.fillMaxWidth())
                }
                error?.let { Text(it, color = Color(0xFFD32F2F)) }
            }
        },
        confirmButton = {
            Button(
                enabled = (picked != null || imageUrl.isNotBlank()) && progress == null,
                onClick = {
                    val uri = picked
                    if (uri == null) {
                        onSave(Banner(imageUrl = imageUrl.trim(), linkUrl = link.trim()))
                    } else {
                        scope.launch {
                            progress = 0f
                            try {
                                val (url, path) = Repository.uploadFile(uri, "banners", "jpg") { progress = it }
                                onSave(Banner(imageUrl = url, storagePath = path, linkUrl = link.trim()))
                            } catch (e: Exception) {
                                error = "Upload failed: ${e.localizedMessage}"
                            } finally {
                                progress = null
                            }
                        }
                    }
                },
            ) { Text("Add") }
        },
        dismissButton = { TextButton(onClick = onDismiss, enabled = progress == null) { Text("Cancel") } },
    )
}

