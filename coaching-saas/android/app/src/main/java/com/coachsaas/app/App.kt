package com.coachsaas.app

import android.app.Application
import com.coachsaas.app.data.Repo
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.coachsaas.app.notify.CheckWorker
import com.google.firebase.FirebaseApp
import java.util.concurrent.TimeUnit

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        // Firebase auto-initialises only when google-services.json was present at build time.
        Repo.ready = FirebaseApp.getApps(this).isNotEmpty()
        if (Repo.ready) {
            val request = PeriodicWorkRequestBuilder<CheckWorker>(15, TimeUnit.MINUTES)
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .build()
            WorkManager.getInstance(this)
                .enqueueUniquePeriodicWork("coach-check", ExistingPeriodicWorkPolicy.KEEP, request)
        }
    }
}
