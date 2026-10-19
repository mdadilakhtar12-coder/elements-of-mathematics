package com.aspirescience.academy.ui.common

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import com.aspirescience.academy.util.Images
import java.io.File

/** Shows a Base64 photo. */
@Composable
fun PhotoView(data: String, modifier: Modifier = Modifier) {
    val bmp = remember(data) { Images.decode(data)?.asImageBitmap() }
    if (bmp != null) {
        Image(bmp, contentDescription = "Photo", modifier = modifier.fillMaxWidth().heightIn(max = 420.dp), contentScale = ContentScale.Fit)
    } else {
        Text("Photo could not be shown")
    }
}

/** Take a photo with the camera or choose one from the gallery. [photo] holds the Base64 text. */
@Composable
fun PhotoPicker(photo: String?, onChange: (String?) -> Unit) {
    val ctx = LocalContext.current
    var pending by remember { mutableStateOf<Uri?>(null) }
    val gallery = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) onChange(Images.encode(ctx, uri))
    }
    val camera = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { ok ->
        val u = pending
        if (ok && u != null) onChange(Images.encode(ctx, u))
    }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = {
                val dir = File(ctx.cacheDir, "photos")
                dir.mkdirs()
                val f = File(dir, "p" + System.currentTimeMillis() + ".jpg")
                val uri = FileProvider.getUriForFile(ctx, ctx.packageName + ".fileprovider", f)
                pending = uri
                camera.launch(uri)
            }) { Text("Take photo") }
            OutlinedButton(onClick = { gallery.launch("image/*") }) { Text("Choose from gallery") }
        }
        if (photo != null) {
            PhotoView(photo, Modifier.fillMaxWidth())
            TextButton(onClick = { onChange(null) }) { Text("Remove photo") }
        }
    }
}
