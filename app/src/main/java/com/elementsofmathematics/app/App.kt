package com.elementsofmathematics.app

import android.app.Application
import coil.ImageLoader
import coil.ImageLoaderFactory
import coil.map.Mapper
import coil.request.Options
import com.elementsofmathematics.app.data.BannerImageData
import com.elementsofmathematics.app.data.LocalStore
import com.elementsofmathematics.app.data.PdfCache
import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings
import com.google.firebase.firestore.MemoryCacheSettings
import java.nio.ByteBuffer

class App : Application(), ImageLoaderFactory {
    override fun newImageLoader(): ImageLoader = ImageLoader.Builder(this)
        .components {
            // Coil 2 handles URLs and byte buffers, but has no data-URI fetcher.
            add(object : Mapper<String, ByteBuffer> {
                override fun map(data: String, options: Options): ByteBuffer? = BannerImageData.decode(data)
            })
        }
        .build()

    override fun onCreate() {
        super.onCreate()
        LocalStore.init(this)
        PdfCache.clearStaging(this)
        if (FirebaseApp.getApps(this).isNotEmpty()) {
            // PDF chunks must not be copied into Firestore's plaintext disk cache.
            FirebaseFirestore.getInstance().firestoreSettings = FirebaseFirestoreSettings.Builder()
                .setLocalCacheSettings(MemoryCacheSettings.newBuilder().build()).build()
        }
    }
}
