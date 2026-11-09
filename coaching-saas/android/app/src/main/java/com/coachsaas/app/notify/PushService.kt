package com.coachsaas.app.notify

import com.coachsaas.app.data.Repo
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Receives FCM pushes sent by the Cloud Functions (functions/src/notify.js).
 * While the app is in the background Android shows the notification itself; this service handles
 * the foreground case and keeps the device token registered when Firebase rotates it.
 */
class PushService : FirebaseMessagingService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNewToken(token: String) {
        if (!Repo.ready || Repo.auth.currentUser == null) return
        scope.launch {
            try {
                Repo.registerDevice(token)
            } catch (e: Exception) {
                // Registered again at the next app start.
            }
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val n = message.notification ?: return
        Notifier.show(applicationContext, (message.messageId ?: n.title.orEmpty()).hashCode(), n.title.orEmpty(), n.body.orEmpty())
    }
}
