package com.aspirescience.academy

import android.app.Application
import com.aspirescience.academy.data.Repo
import com.google.firebase.FirebaseApp

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        // Firebase auto-initialises only when google-services.json was present at build time.
        Repo.ready = FirebaseApp.getApps(this).isNotEmpty()
    }
}
