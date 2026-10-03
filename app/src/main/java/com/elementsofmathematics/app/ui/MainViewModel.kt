package com.elementsofmathematics.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.elementsofmathematics.app.data.AppSettings
import com.elementsofmathematics.app.data.Banner
import com.elementsofmathematics.app.data.ContentItem
import com.elementsofmathematics.app.data.Repository
import com.elementsofmathematics.app.data.Section
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {
    val settings: StateFlow<AppSettings> = Repository.settingsFlow()
        .stateIn(viewModelScope, SharingStarted.Eagerly, AppSettings())

    val banners: StateFlow<List<Banner>> = Repository.bannersFlow()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    /** null while the first load is still running. */
    val sections: StateFlow<List<Section>?> = Repository.sectionsFlow()
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    val isAdmin: StateFlow<Boolean> = Repository.isAdminFlow()
        .stateIn(viewModelScope, SharingStarted.Eagerly, false)

    private val itemFlows = mutableMapOf<String, StateFlow<List<ContentItem>?>>()

    fun items(sectionId: String): StateFlow<List<ContentItem>?> = itemFlows.getOrPut(sectionId) {
        Repository.itemsFlow(sectionId).stateIn(viewModelScope, SharingStarted.WhileSubscribed(60_000), null)
    }

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 4)
    val messages: SharedFlow<String> = _messages

    fun showMessage(text: String) {
        _messages.tryEmit(text)
    }

    /** Runs an admin action and reports success or the error as a snackbar message. */
    fun run(successMessage: String?, block: suspend () -> Unit) {
        viewModelScope.launch {
            try {
                block()
                successMessage?.let { _messages.emit(it) }
            } catch (e: Exception) {
                _messages.emit(e.localizedMessage ?: "Something went wrong")
            }
        }
    }

    /** Moves an element one step up/down by swapping `order` with its neighbour. */
    fun <T> move(list: List<T>, index: Int, delta: Int, path: (T) -> String, order: (T) -> Long) {
        val other = index + delta
        if (other !in list.indices) return
        val a = list[index]
        val b = list[other]
        val orderA = order(a)
        // Neighbours may share an order value (e.g. both 0); make sure the swap changes something.
        val orderB = if (order(b) == orderA) orderA + delta else order(b)
        run(null) { Repository.swapOrder(path(a), orderA, path(b), orderB) }
    }

    fun <T> nextOrder(list: List<T>?, order: (T) -> Long): Long = (list?.maxOfOrNull(order) ?: -1) + 1

}
