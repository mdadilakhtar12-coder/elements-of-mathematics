package com.elementsofmathematics.app.ui.admin

import android.net.Uri
import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.elementsofmathematics.app.data.AppSettings
import com.elementsofmathematics.app.data.ContentItem
import com.elementsofmathematics.app.data.MoreApp
import com.elementsofmathematics.app.data.Repository
import com.elementsofmathematics.app.data.SECTION_ICONS
import com.elementsofmathematics.app.data.Section
import com.elementsofmathematics.app.data.SectionType
import com.elementsofmathematics.app.ui.common.SectionIcon
import com.elementsofmathematics.app.ui.theme.Purple
import com.elementsofmathematics.app.util.YouTube
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import kotlinx.coroutines.launch

@Composable
fun AdminLoginDialog(onDismiss: () -> Unit, onSuccess: () -> Unit) {
    var password by remember { mutableStateOf("") }
    var visible by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    AlertDialog(
        onDismissRequest = { if (!loading) onDismiss() },
        title = { Text("Admin Login") },
        text = {
            Column {
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it; error = null },
                    label = { Text("Password") },
                    singleLine = true,
                    isError = error != null,
                    supportingText = error?.let { { Text(it) } },
                    visualTransformation = if (visible) VisualTransformation.None else PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    trailingIcon = {
                        IconButton(onClick = { visible = !visible }) {
                            Icon(if (visible) Icons.Default.VisibilityOff else Icons.Default.Visibility, null)
                        }
                    },
                )
                if (loading) LinearProgressIndicator(Modifier.fillMaxWidth().padding(top = 8.dp))
            }
        },
        confirmButton = {
            Button(
                enabled = password.isNotEmpty() && !loading,
                onClick = {
                    loading = true
                    scope.launch {
                        try {
                            Repository.adminLogin(password)
                            onSuccess()
                        } catch (e: FirebaseAuthInvalidCredentialsException) {
                            error = "Wrong password"
                        } catch (e: Exception) {
                            error = e.localizedMessage ?: "Login failed"
                        } finally {
                            loading = false
                        }
                    }
                },
            ) { Text("Login") }
        },
        dismissButton = { TextButton(onClick = onDismiss, enabled = !loading) { Text("Cancel") } },
    )
}

@Composable
fun ConfirmDialog(title: String, message: String, onDismiss: () -> Unit, onConfirm: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = { Text(message) },
        confirmButton = {
            TextButton(onClick = onConfirm) { Text("Delete", color = Color(0xFFD32F2F)) }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SectionEditorDialog(section: Section, onDismiss: () -> Unit, onSave: (Section) -> Unit) {
    var title by remember { mutableStateOf(section.title) }
    var icon by remember { mutableStateOf(section.icon) }
    var type by remember { mutableStateOf(section.type) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (section.id.isEmpty()) "Add Section" else "Edit Section") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Section name") },
                    placeholder = { Text("e.g. Revision Notes") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(12.dp))
                Text("This section contains", fontWeight = FontWeight.Medium)
                SectionType.entries.forEach { t ->
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .clickable { type = t }
                            .padding(vertical = 2.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        RadioButton(selected = type == t, onClick = { type = t })
                        Text(t.label)
                    }
                }
                Spacer(Modifier.height(8.dp))
                Text("Icon", fontWeight = FontWeight.Medium)
                Spacer(Modifier.height(6.dp))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    SECTION_ICONS.forEach { option ->
                        Box(
                            Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (option == icon) Purple.copy(alpha = 0.18f) else Color.Transparent)
                                .border(
                                    if (option == icon) 2.dp else 1.dp,
                                    if (option == icon) Purple else Color(0xFFE0E0E0),
                                    RoundedCornerShape(10.dp),
                                )
                                .clickable { icon = option },
                            contentAlignment = Alignment.Center,
                        ) { SectionIcon(option, 30.dp) }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                enabled = title.isNotBlank(),
                onClick = { onSave(section.copy(title = title.trim(), icon = icon, type = type)) },
            ) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}

/** Add/edit a chapter PDF (upload from phone or paste link) or a YouTube video. */
@Composable
fun ItemEditorDialog(
    type: SectionType,
    item: ContentItem,
    onDismiss: () -> Unit,
    onSave: (ContentItem, oldStoragePathToDelete: String?) -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var title by remember { mutableStateOf(item.title) }
    var link by remember { mutableStateOf(if (item.storagePath.isEmpty()) item.url else "") }
    var pickedUri by remember { mutableStateOf<Uri?>(null) }
    var pickedName by remember { mutableStateOf<String?>(null) }
    var progress by remember { mutableStateOf<Float?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            pickedUri = uri
            pickedName = context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)
                ?.use { c -> if (c.moveToFirst()) c.getString(0) else null }
            if (title.isBlank()) title = pickedName?.removeSuffix(".pdf")?.removeSuffix(".PDF").orEmpty()
            link = ""
        }
    }

    val isVideo = type == SectionType.VIDEO
    val videoId = if (isVideo) YouTube.videoId(link) else null
    val uploading = progress != null
    val hasExistingUpload = item.storagePath.isNotEmpty() && pickedUri == null && link.isBlank()
    val canSave = title.isNotBlank() && !uploading && when {
        isVideo -> videoId != null
        else -> pickedUri != null || link.isNotBlank() || hasExistingUpload
    }

    AlertDialog(
        onDismissRequest = { if (!uploading) onDismiss() },
        title = { Text(if (item.id.isEmpty()) (if (isVideo) "Add Video" else "Add PDF") else "Edit") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title") },
                    placeholder = { Text("e.g. Relations and Functions") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(12.dp))
                if (isVideo) {
                    OutlinedTextField(
                        value = link,
                        onValueChange = { link = it },
                        label = { Text("YouTube link") },
                        placeholder = { Text("https://youtu.be/…") },
                        singleLine = true,
                        isError = link.isNotBlank() && videoId == null,
                        supportingText = { if (link.isNotBlank() && videoId == null) Text("Not a valid YouTube link") },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    if (videoId != null) {
                        AsyncImage(
                            model = YouTube.thumbnail(videoId),
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(16 / 9f)
                                .clip(RoundedCornerShape(10.dp)),
                        )
                    }
                } else {
                    OutlinedButton(
                        onClick = { picker.launch(arrayOf("application/pdf")) },
                        enabled = !uploading,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Icon(Icons.Default.UploadFile, null)
                        Spacer(Modifier.width(8.dp))
                        Text(pickedName ?: "Choose PDF from phone")
                    }
                    if (hasExistingUpload) {
                        Text("Current: uploaded PDF (choose a new file to replace it)", fontSize = 12.sp, color = Color.Gray)
                    }
                    Text("— or —", color = Color.Gray, modifier = Modifier.align(Alignment.CenterHorizontally).padding(8.dp))
                    OutlinedTextField(
                        value = link,
                        onValueChange = { link = it; if (it.isNotBlank()) { pickedUri = null; pickedName = null } },
                        label = { Text("Paste PDF link") },
                        placeholder = { Text("Google Drive or direct .pdf link") },
                        singleLine = true,
                        enabled = !uploading,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    progress?.let {
                        Spacer(Modifier.height(10.dp))
                        Text("Uploading… ${(it * 100).toInt()}%")
                        LinearProgressIndicator(progress = { it }, modifier = Modifier.fillMaxWidth())
                    }
                }
                error?.let { Text(it, color = Color(0xFFD32F2F), modifier = Modifier.padding(top = 8.dp)) }
            }
        },
        confirmButton = {
            Button(enabled = canSave, onClick = {
                error = null
                val uri = pickedUri
                when {
                    isVideo -> onSave(item.copy(title = title.trim(), url = link.trim(), storagePath = ""), null)
                    uri != null -> scope.launch {
                        progress = 0f
                        try {
                            val (url, path) = Repository.uploadFile(uri, "pdfs", "pdf") { progress = it }
                            onSave(item.copy(title = title.trim(), url = url, storagePath = path), item.storagePath)
                        } catch (e: Exception) {
                            error = "Upload failed: ${e.localizedMessage}"
                        } finally {
                            progress = null
                        }
                    }
                    link.isNotBlank() -> onSave(item.copy(title = title.trim(), url = link.trim(), storagePath = ""), item.storagePath)
                    else -> onSave(item.copy(title = title.trim()), null)
                }
            }) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss, enabled = !uploading) { Text("Cancel") } },
    )
}

@Composable
fun AppSettingsDialog(settings: AppSettings, onDismiss: () -> Unit, onSave: (AppSettings) -> Unit) {
    var title by remember { mutableStateOf(settings.appTitle) }
    var email by remember { mutableStateOf(settings.feedbackEmail) }
    val apps = remember { mutableStateListOf<MoreApp>().apply { addAll(settings.moreApps) } }
    var newAppTitle by remember { mutableStateOf("") }
    var newAppUrl by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("App Settings") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(title, { title = it }, label = { Text("App title (top bar)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    email, { email = it }, label = { Text("Feedback email") }, singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(16.dp))
                Text("More Apps (shown in the side menu)", fontWeight = FontWeight.Medium)
                apps.forEachIndexed { i, app ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(app.title)
                            Text(app.url, fontSize = 11.sp, color = Color.Gray, maxLines = 1)
                        }
                        IconButton(onClick = { apps.removeAt(i) }) { Icon(Icons.Default.Delete, "Remove") }
                    }
                }
                HorizontalDivider(Modifier.padding(vertical = 6.dp))
                OutlinedTextField(newAppTitle, { newAppTitle = it }, label = { Text("App name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(newAppUrl, { newAppUrl = it }, label = { Text("Play Store link") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                TextButton(
                    enabled = newAppTitle.isNotBlank() && newAppUrl.isNotBlank(),
                    onClick = {
                        apps.add(MoreApp(newAppTitle.trim(), newAppUrl.trim()))
                        newAppTitle = ""
                        newAppUrl = ""
                    },
                ) {
                    Icon(Icons.Default.Add, null)
                    Text(" Add app")
                }
            }
        },
        confirmButton = {
            Button(enabled = title.isNotBlank(), onClick = {
                onSave(settings.copy(appTitle = title.trim(), feedbackEmail = email.trim(), moreApps = apps.toList()))
            }) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}

@Composable
fun ChangePasswordDialog(onDismiss: () -> Unit, onSave: (String) -> Unit) {
    var pass by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    val valid = pass.length >= 6 && pass == confirm
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Change Admin Password") },
        text = {
            Column {
                OutlinedTextField(
                    pass, { pass = it }, label = { Text("New password (min 6 characters)") }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                )
                OutlinedTextField(
                    confirm, { confirm = it }, label = { Text("Confirm password") }, singleLine = true,
                    isError = confirm.isNotEmpty() && confirm != pass,
                    visualTransformation = PasswordVisualTransformation(),
                )
            }
        },
        confirmButton = { Button(enabled = valid, onClick = { onSave(pass) }) { Text("Change") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
