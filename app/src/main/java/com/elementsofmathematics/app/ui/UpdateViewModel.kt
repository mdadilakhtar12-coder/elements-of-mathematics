package com.elementsofmathematics.app.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.elementsofmathematics.app.BuildConfig
import com.elementsofmathematics.app.data.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout

sealed interface UpdateState {
    data object Idle : UpdateState
    data class Checking(val manual: Boolean) : UpdateState
    data class Available(val release: AppRelease) : UpdateState
    data class Downloading(val release: AppRelease, val progress: Float?) : UpdateState
    data class Ready(val release: AppRelease) : UpdateState
    data class Message(val text: String) : UpdateState
}

class UpdateViewModel(app: Application) : AndroidViewModel(app) {
    private val _state = MutableStateFlow<UpdateState>(UpdateState.Idle)
    val state: StateFlow<UpdateState> = _state
    private var job: Job? = null
    private var lastAutoCheck = 0L

    fun check(manual: Boolean = false) {
        if (job?.isActive == true || _state.value is UpdateState.Ready || _state.value is UpdateState.Available) return
        val now = android.os.SystemClock.elapsedRealtime()
        if (!manual && lastAutoCheck != 0L && now - lastAutoCheck < 60_000) return
        lastAutoCheck = now
        _state.value = UpdateState.Checking(manual)
        job = viewModelScope.launch {
            try {
                val release = withTimeout(25_000) { Repository.latestRelease() }
                _state.value = when {
                    release != null && release.versionCode > BuildConfig.VERSION_CODE -> UpdateState.Available(release)
                    manual -> UpdateState.Message("Version ${BuildConfig.VERSION_NAME} is installed. No newer update is available.")
                    else -> UpdateState.Idle
                }
            } catch (e: kotlinx.coroutines.TimeoutCancellationException) {
                _state.value = if (manual) UpdateState.Message("Could not check for updates. Check your connection and try again.") else UpdateState.Idle
            } catch (e: CancellationException) { throw e
            } catch (e: Exception) {
                _state.value = if (manual) UpdateState.Message("Could not check for updates. Check your connection and try again.") else UpdateState.Idle
            }
        }
    }

    fun download(release: AppRelease) {
        if (job?.isActive == true) return
        _state.value = UpdateState.Downloading(release, null)
        job = viewModelScope.launch {
            val context = getApplication<Application>()
            val apk = UpdateInstaller.file(context)
            try {
                ApkDownloader.download(release, apk, progress = { _state.value = UpdateState.Downloading(release, it) })
                UpdateInstaller.verify(context, apk, release)
                _state.value = UpdateState.Ready(release)
            } catch (e: CancellationException) { apk.delete(); throw e
            } catch (e: Exception) {
                apk.delete()
                _state.value = UpdateState.Message(e.localizedMessage ?: "Update failed. Please try again")
            }
        }
    }

    fun dismiss() {
        job?.cancel()
        _state.value = UpdateState.Idle
    }
    fun error(message: String) { _state.value = UpdateState.Message(message) }
}
