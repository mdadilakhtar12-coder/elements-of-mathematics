package com.elementsofmathematics.app.data

import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import com.elementsofmathematics.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

object UpdateInstaller {
    fun file(context: Context) = File(context.cacheDir, "updates").apply { mkdirs() }.let { File(it, "update.apk") }

    @Suppress("DEPRECATION")
    suspend fun verify(context: Context, apk: File, release: AppRelease, requireNewer: Boolean = true) = withContext(Dispatchers.IO) {
        val pm = context.packageManager
        val flags = if (Build.VERSION.SDK_INT >= 28) PackageManager.GET_SIGNING_CERTIFICATES else PackageManager.GET_SIGNATURES
        val installed = pm.getPackageInfo(context.packageName, flags)
        val candidate = pm.getPackageArchiveInfo(apk.path, flags) ?: error("Downloaded file is not a valid Android APK")
        fun signers(info: PackageInfo): Set<String> =
            (if (Build.VERSION.SDK_INT >= 28) info.signingInfo?.apkContentsSigners else info.signatures)
                ?.map { UpdatePolicy.digest(it.toByteArray()) }?.toSet().orEmpty()
        val version = if (Build.VERSION.SDK_INT >= 28) candidate.longVersionCode else candidate.versionCode.toLong()
        UpdatePolicy.requireCompatible(release, BuildConfig.VERSION_CODE.toLong(), context.packageName,
            candidate.packageName, version, signers(installed), signers(candidate), requireNewer)
    }

    fun canInstall(context: Context) = context.packageManager.canRequestPackageInstalls()

    fun permissionIntent(context: Context) = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
        Uri.parse("package:${context.packageName}"))

    fun install(context: Context, apk: File) {
        require(apk.canonicalFile == file(context).canonicalFile && apk.isFile) { "Update file is missing. Download again" }
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.updates", apk)
        context.startActivity(Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/vnd.android.package-archive")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION))
    }
}
