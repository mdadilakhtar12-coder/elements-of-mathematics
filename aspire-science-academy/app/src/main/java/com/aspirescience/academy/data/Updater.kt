package com.aspirescience.academy.data

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.core.content.FileProvider
import com.aspirescience.academy.AppConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

/** In-app updates: looks at the newest GitHub release, downloads the APK and opens the installer. */
object Updater {
    class Info(val build: Int, val url: String)

    suspend fun check(): Info? = withContext(Dispatchers.IO) {
        try {
            val c = URL("https://api.github.com/repos/" + AppConfig.UPDATE_REPO + "/releases/tags/aspire-latest")
                .openConnection() as HttpURLConnection
            c.connectTimeout = 8000
            c.readTimeout = 8000
            c.setRequestProperty("Accept", "application/vnd.github+json")
            if (c.responseCode != 200) return@withContext null
            val j = JSONObject(c.inputStream.bufferedReader().readText())
            val build = Regex("build:(\\d+)").find(j.optString("body"))?.groupValues?.get(1)?.toIntOrNull()
                ?: return@withContext null
            val assets = j.optJSONArray("assets") ?: return@withContext null
            for (i in 0 until assets.length()) {
                val a = assets.getJSONObject(i)
                if (a.optString("name").endsWith(".apk")) {
                    return@withContext Info(build, a.getString("browser_download_url"))
                }
            }
            null
        } catch (e: Exception) {
            null
        }
    }

    suspend fun download(ctx: Context, url: String, onProgress: (Int) -> Unit): File = withContext(Dispatchers.IO) {
        val dir = File(ctx.cacheDir, "updates")
        dir.mkdirs()
        val out = File(dir, "aspire.apk")
        val c = URL(url).openConnection() as HttpURLConnection
        c.connectTimeout = 15000
        c.readTimeout = 30000
        val total = c.contentLength
        c.inputStream.use { input ->
            out.outputStream().use { os ->
                val buf = ByteArray(32 * 1024)
                var done = 0L
                var last = -1
                while (true) {
                    val n = input.read(buf)
                    if (n < 0) break
                    os.write(buf, 0, n)
                    done += n
                    if (total > 0) {
                        val pct = (done * 100 / total).toInt()
                        if (pct != last) {
                            last = pct
                            onProgress(pct)
                        }
                    }
                }
            }
        }
        out
    }

    /** False when the user first has to allow "install unknown apps" for this app (settings are opened). */
    fun canInstall(ctx: Context): Boolean {
        if (ctx.packageManager.canRequestPackageInstalls()) return true
        val i = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + ctx.packageName))
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(i)
        return false
    }

    fun install(ctx: Context, apk: File) {
        val uri = FileProvider.getUriForFile(ctx, ctx.packageName + ".fileprovider", apk)
        val i = Intent(Intent.ACTION_VIEW)
        i.setDataAndType(uri, "application/vnd.android.package-archive")
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(i)
    }
}
