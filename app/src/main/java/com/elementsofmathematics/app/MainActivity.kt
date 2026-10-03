package com.elementsofmathematics.app

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.elementsofmathematics.app.data.Repository
import com.elementsofmathematics.app.ui.MainViewModel
import com.elementsofmathematics.app.ui.home.HomeScreen
import com.elementsofmathematics.app.ui.pdf.PdfViewerScreen
import com.elementsofmathematics.app.ui.section.SectionScreen
import com.elementsofmathematics.app.ui.theme.AppTheme
import com.elementsofmathematics.app.ui.video.VideoPlayerScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            AppTheme {
                if (Repository.isFirebaseConfigured(LocalContext.current)) AppNavigation() else FirebaseMissing()
            }
        }
    }
}

object Routes {
    const val HOME = "home"
    const val SECTION = "section/{sectionId}"
    const val VIDEO = "video/{sectionId}/{itemId}"
    const val PDF = "pdf?path={path}&title={title}&key={key}"

    fun section(id: String) = "section/$id"
    fun video(sectionId: String, itemId: String) = "video/$sectionId/$itemId"
    fun pdf(path: String, title: String, key: String) =
        "pdf?path=${Uri.encode(path)}&title=${Uri.encode(title)}&key=${Uri.encode(key)}"
}

@Composable
private fun AppNavigation() {
    val nav = rememberNavController()
    val vm: MainViewModel = viewModel()
    NavHost(navController = nav, startDestination = Routes.HOME) {
        composable(Routes.HOME) {
            HomeScreen(vm, onOpenSection = { nav.navigate(Routes.section(it)) })
        }
        composable(Routes.SECTION) { entry ->
            val sectionId = entry.arguments?.getString("sectionId").orEmpty()
            SectionScreen(
                vm = vm,
                sectionId = sectionId,
                onBack = { nav.popBackStack() },
                onOpenPdf = { path, title, key -> nav.navigate(Routes.pdf(path, title, key)) },
                onOpenVideo = { itemId -> nav.navigate(Routes.video(sectionId, itemId)) },
            )
        }
        composable(
            Routes.PDF,
            arguments = listOf(
                navArgument("path") { type = NavType.StringType; defaultValue = "" },
                navArgument("title") { type = NavType.StringType; defaultValue = "" },
                navArgument("key") { type = NavType.StringType; defaultValue = "" },
            ),
        ) { entry ->
            val args = entry.arguments
            PdfViewerScreen(
                path = args?.getString("path").orEmpty(),
                title = args?.getString("title").orEmpty(),
                docKey = args?.getString("key").orEmpty(),
                onBack = { nav.popBackStack() },
            )
        }
        composable(Routes.VIDEO) { entry ->
            VideoPlayerScreen(
                vm = vm,
                sectionId = entry.arguments?.getString("sectionId").orEmpty(),
                initialItemId = entry.arguments?.getString("itemId").orEmpty(),
                onBack = { nav.popBackStack() },
            )
        }
    }
}

@Composable
private fun FirebaseMissing() {
    Column(
        Modifier.fillMaxSize().padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("Setup required", style = MaterialTheme.typography.headlineSmall)
        Text(
            "Firebase is not connected yet. Add your google-services.json file to the app folder and build again (see README).",
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 12.dp),
        )
    }
}
