package com.coachsaas.app

import android.app.Application
import com.coachsaas.app.data.Repo
import com.coachsaas.app.notify.Notifier
import com.google.firebase.FirebaseApp

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        // Firebase auto-initialises only when google-services.json was present at build time.
        Repo.ready = FirebaseApp.getApps(this).isNotEmpty()
        // Push messages (FCM) are sent by Cloud Functions; the channel must exist before the first one arrives.
        Notifier.ensureChannel(this)
    }
}
