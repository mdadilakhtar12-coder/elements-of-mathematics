package com.elementsofmathematics.app

import android.app.Application
import com.elementsofmathematics.app.data.LocalStore

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        LocalStore.init(this)
    }
}
