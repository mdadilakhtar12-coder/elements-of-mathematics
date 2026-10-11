package com.elementsofmathematics.app.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import java.io.File
import java.net.HttpURLConnection
import java.net.URI
import java.net.URL
import java.security.MessageDigest
import java.nio.file.Files
import java.nio.file.StandardCopyOption

data class AppRelease(
    val versionCode: Long = 0,
    val versionName: String = "",
    val apkUrl: String = "",
    val sha256: String = "",
    val notes: String = "",
) {
    fun validate() {
        require(versionCode > 0 && versionName.isNotBlank()) { "Enter the release version" }
        require(versionName.length <= 80 && notes.length <= 4000) { "Release details are too long" }
        UpdatePolicy.requireSecureUrl(apkUrl)
        require(sha256.matches(Regex("[a-fA-F0-9]{64}"))) { "Enter the APK's 64-character SHA-256 checksum" }
    }
}

internal object UpdatePolicy {
    fun requireSecureUrl(link: String) {
        val uri = runCatching { URI(link) }.getOrNull()
        require(uri?.scheme == "https" && !uri.host.isNullOrBlank() && uri.userInfo == null) {
            "Use a direct HTTPS APK download link"
        }
    }

    fun requireCompatible(expected: AppRelease, installedVersion: Long, packageName: String,
                          actualPackage: String, actualVersion: Long,
                          installedSigners: Set<String>, apkSigners: Set<String>,
                          requireNewer: Boolean = true) {
        require(actualPackage == packageName) { "This APK belongs to a different app" }
        require(actualVersion == expected.versionCode) { "APK version does not match the published release" }
        require(!requireNewer || actualVersion > installedVersion) { "This update is already installed" }
        require(installedSigners.isNotEmpty() && apkSigners == installedSigners) {
            "APK signing certificate does not match this app"
        }
    }

    fun digest(bytes: ByteArray): String = MessageDigest.getInstance("SHA-256").digest(bytes)
        .joinToString("") { "%02x".format(it) }
}

/** HTTPS at every redirect; bounded download, checksum, atomic replacement and cancellation cleanup. */
internal object ApkDownloader {
    const val MAX_BYTES = 150L * 1024 * 1024

    suspend fun download(release: AppRelease, target: File, progress: (Float?) -> Unit,
                         connection: (URL) -> HttpURLConnection = { it.openConnection() as HttpURLConnection }): File =
        withContext(Dispatchers.IO) {
            release.validate()
            val part = File.createTempFile("update-", ".part", target.parentFile)
            try {
                var url = URL(release.apkUrl)
                var redirects = 0
                val digest = MessageDigest.getInstance("SHA-256")
                while (true) {
                    ensureActive()
                    UpdatePolicy.requireSecureUrl(url.toString())
                    val conn = connection(url)
                    try {
                        conn.connectTimeout = 20_000
                        conn.readTimeout = 30_000
                        conn.instanceFollowRedirects = false
                        conn.setRequestProperty("Accept-Encoding", "identity")
                        val code = conn.responseCode
                        if (code in listOf(301, 302, 303, 307, 308)) {
                            check(redirects++ < 8) { "Too many download redirects" }
                            url = URL(url, conn.getHeaderField("Location") ?: error("Invalid download redirect"))
                            continue
                        }
                        check(code == 200) { "Update server returned $code. Please try again" }
                        val total = conn.contentLengthLong
                        check(total <= MAX_BYTES) { "APK exceeds the 150 MB limit" }
                        var count = 0L
                        conn.inputStream.use { input ->
                            part.outputStream().use { output ->
                                val buffer = ByteArray(64 * 1024)
                                while (true) {
                                    ensureActive()
                                    val n = input.read(buffer)
                                    if (n < 0) break
                                    count += n
                                    check(count <= MAX_BYTES) { "APK exceeds the 150 MB limit" }
                                    digest.update(buffer, 0, n)
                                    output.write(buffer, 0, n)
                                    progress(if (total > 0) (count.toFloat() / total).coerceIn(0f, 1f) else null)
                                }
                            }
                        }
                        check(count > 0 && (total < 0 || count == total)) { "Update download was interrupted" }
                        break
                    } finally { conn.disconnect() }
                }
                ensureActive()
                val actualHash = digest.digest().joinToString("") { "%02x".format(it) }
                check(actualHash.equals(release.sha256, ignoreCase = true)) { "APK checksum failed. Please download again" }
                Files.move(part.toPath(), target.toPath(), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING)
                target
            } finally { part.delete() }
        }
}
