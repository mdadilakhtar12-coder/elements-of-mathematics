plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "app.phonecontrol"
    compileSdk = 35

    defaultConfig {
        applicationId = "app.phonecontrol"
        minSdk = 26
        targetSdk = 35
        // CI sets VERSION_CODE to the run number, so every new APK installs over the old one.
        versionCode = (System.getenv("VERSION_CODE") ?: "1").toInt()
        versionName = "1." + (System.getenv("VERSION_CODE") ?: "1")
    }

    // One fixed key (password "android"), so a newer APK can be installed over an older one
    // without uninstalling (which would also wipe the pairing and the Accessibility switch).
    signingConfigs {
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { buildConfig = true }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    // WebSocket client used to talk to the relay server (Phase 2).
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.json:json:20240303")
}
