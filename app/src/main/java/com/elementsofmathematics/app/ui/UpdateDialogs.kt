package com.elementsofmathematics.app.ui

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.elementsofmathematics.app.BuildConfig
import com.elementsofmathematics.app.data.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import java.io.File

@Composable
fun UpdateHost(vm: UpdateViewModel) {
    val state by vm.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    DisposableEffect(lifecycle) {
        val observer = LifecycleEventObserver { _, event -> if (event == Lifecycle.Event.ON_START) vm.check() }
        lifecycle.addObserver(observer)
        if (lifecycle.currentState.isAtLeast(Lifecycle.State.STARTED)) vm.check()
        onDispose { lifecycle.removeObserver(observer) }
    }
    fun install() {
        runCatching { UpdateInstaller.install(context, UpdateInstaller.file(context)) }
            .onFailure { vm.error(it.localizedMessage ?: "Could not open the Android installer") }
    }
    val permission = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        if (UpdateInstaller.canInstall(context) && vm.state.value is UpdateState.Ready) install()
    }
    val current = state
    if (current == UpdateState.Idle || current is UpdateState.Checking && !current.manual) return
    val busy = current is UpdateState.Downloading || current is UpdateState.Checking
    AlertDialog(
        onDismissRequest = { if (!busy) vm.dismiss() },
        properties = DialogProperties(dismissOnBackPress = !busy, dismissOnClickOutside = !busy),
        title = { Text(when (current) {
            is UpdateState.Available -> "Update available"
            is UpdateState.Downloading -> "Downloading update"
            is UpdateState.Ready -> "Ready to install"
            is UpdateState.Checking -> "Checking for updates"
            else -> "App updates"
        }) },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                when (current) {
                    is UpdateState.Available -> {
                        Text("Version ${current.release.versionName}")
                        if (current.release.notes.isNotBlank()) Text(current.release.notes)
                        Text("Your downloads and bookmarks will stay on this phone.")
                    }
                    is UpdateState.Downloading -> {
                        val p = current.progress
                        if (p == null) LinearProgressIndicator(Modifier.fillMaxWidth())
                        else LinearProgressIndicator(progress = { p }, modifier = Modifier.fillMaxWidth())
                        Text(if (p == null) "Please wait…" else if (p >= 1f) "Verifying update…" else "${(p * 100).toInt()}%")
                    }
                    is UpdateState.Ready -> Text("Version ${current.release.versionName} is verified. Android will ask you to confirm installation. If asked, allow updates from this app.")
                    is UpdateState.Checking -> LinearProgressIndicator(Modifier.fillMaxWidth())
                    is UpdateState.Message -> Text(current.text)
                    else -> Unit
                }
            }
        },
        confirmButton = {
            when (current) {
                is UpdateState.Available -> TextButton(onClick = { vm.download(current.release) }) { Text("Update") }
                is UpdateState.Ready -> TextButton(onClick = {
                    if (UpdateInstaller.canInstall(context)) install()
                    else runCatching { permission.launch(UpdateInstaller.permissionIntent(context)) }
                        .onFailure { vm.error("Could not open install permission settings. Try again.") }
                }) { Text("Install") }
                is UpdateState.Message -> TextButton(onClick = vm::dismiss) { Text("OK") }
                else -> Unit
            }
        },
        dismissButton = {
            if (current !is UpdateState.Message) TextButton(onClick = vm::dismiss) {
                Text(if (busy) "Cancel" else "Later")
            }
        },
    )
}

/** Only admin can publish the shared release document; verify the actual hosted APK first. */
@Composable
fun PublishUpdateDialog(onDismiss: () -> Unit, onPublished: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var code by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var url by remember { mutableStateOf("") }
    var hash by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var progress by remember { mutableStateOf<Float?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        try {
            withTimeout(25_000) { Repository.latestRelease() }?.let {
                code = it.versionCode.toString(); name = it.versionName; url = it.apkUrl; hash = it.sha256; notes = it.notes
            }
        } catch (e: kotlinx.coroutines.TimeoutCancellationException) { error = "Could not load release details. Check your connection."
        } catch (e: CancellationException) { throw e
        } catch (e: Exception) { error = "Could not load release details. Check your connection." }
        finally { loading = false }
    }
    AlertDialog(
        onDismissRequest = { if (!busy) onDismiss() },
        properties = DialogProperties(dismissOnBackPress = !busy, dismissOnClickOutside = !busy),
        title = { Text("Publish app update") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Upload the signed APK to a public HTTPS download link, then enter its release details. Publishing makes it available to everyone.")
                if (loading) LinearProgressIndicator(Modifier.fillMaxWidth())
                OutlinedTextField(code, { code = it.filter(Char::isDigit) }, label = { Text("Version code") }, singleLine = true, enabled = !busy && !loading)
                OutlinedTextField(name, { name = it }, label = { Text("Version name") }, singleLine = true, enabled = !busy && !loading)
                OutlinedTextField(url, { url = it }, label = { Text("Direct APK link (HTTPS)") }, enabled = !busy && !loading)
                OutlinedTextField(hash, { hash = it }, label = { Text("APK SHA-256 checksum") }, enabled = !busy && !loading)
                OutlinedTextField(notes, { notes = it }, label = { Text("What's new") }, enabled = !busy && !loading)
                if (busy) {
                    val p = progress
                    if (p == null) LinearProgressIndicator(Modifier.fillMaxWidth())
                    else LinearProgressIndicator(progress = { p }, modifier = Modifier.fillMaxWidth())
                    Text(if (p == null) "Checking release…" else "Verifying APK: ${(p * 100).toInt()}%")
                }
                error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
            }
        },
        confirmButton = {
            TextButton(enabled = !busy && !loading, onClick = {
                busy = true; error = null; progress = null
                scope.launch {
                    val apk = File(context.cacheDir, "release-verification.apk")
                    try {
                        val release = AppRelease(code.toLongOrNull() ?: 0, name.trim(), url.trim(), hash.trim(), notes.trim())
                        release.validate()
                        require(release.versionCode >= BuildConfig.VERSION_CODE) { "Cannot publish an older app version" }
                        val latest = withTimeout(25_000) { Repository.latestRelease() }
                        require(latest == null || release.versionCode >= latest.versionCode) { "A newer release is already published" }
                        ApkDownloader.download(release, apk, progress = { progress = it })
                        UpdateInstaller.verify(context, apk, release, requireNewer = false)
                        withTimeout(25_000) { Repository.publishRelease(release) }
                        onPublished()
                    } catch (e: kotlinx.coroutines.TimeoutCancellationException) { error = "Publishing timed out. Check your connection and try again."
                    } catch (e: CancellationException) { throw e
                    } catch (e: Exception) { error = e.localizedMessage ?: "Could not publish this release" }
                    finally { apk.delete(); busy = false }
                }
            }) { Text("Verify & publish") }
        },
        dismissButton = { TextButton(enabled = !busy, onClick = onDismiss) { Text("Cancel") } },
    )
}
