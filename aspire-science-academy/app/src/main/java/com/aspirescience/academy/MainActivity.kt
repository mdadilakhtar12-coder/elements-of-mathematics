package com.aspirescience.academy

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.Screen
import com.aspirescience.academy.ui.auth.LoginScreen
import com.aspirescience.academy.ui.batch.BatchDetailScreen
import com.aspirescience.academy.ui.batch.BatchEditScreen
import com.aspirescience.academy.ui.exam.ExamDetailScreen
import com.aspirescience.academy.ui.exam.ExamEditScreen
import com.aspirescience.academy.ui.fees.FeeAddScreen
import com.aspirescience.academy.ui.main.ChangePasswordScreen
import com.aspirescience.academy.ui.main.MainScreen
import com.aspirescience.academy.ui.notice.HomeworkAddScreen
import com.aspirescience.academy.ui.notice.HomeworkListScreen
import com.aspirescience.academy.ui.notice.NoticeAddScreen
import com.aspirescience.academy.ui.notice.NoticesScreen
import com.aspirescience.academy.ui.people.PeopleScreen
import com.aspirescience.academy.ui.people.UserDetailScreen
import com.aspirescience.academy.ui.people.UserEditScreen
import com.aspirescience.academy.ui.schedule.ApprovalsScreen
import com.aspirescience.academy.ui.schedule.ClassDetailScreen
import com.aspirescience.academy.ui.schedule.ClassEditScreen
import com.aspirescience.academy.ui.schedule.TeacherReportScreen
import com.aspirescience.academy.ui.theme.AspireTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            AspireTheme {
                if (Repo.ready) Root() else FirebaseMissing()
            }
        }
    }
}

@Composable
private fun FirebaseMissing() {
    Column(
        Modifier.fillMaxSize().systemBarsPadding().padding(28.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Firebase is not connected", style = MaterialTheme.typography.titleLarge, textAlign = TextAlign.Center)
        Text(
            "\nThis build does not contain google-services.json.\n" +
                "Add the file to the app folder and build again (see README).",
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun Root() {
    val vm: AppViewModel = viewModel()
    UpdateDialog(vm)
    when {
        vm.booting -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        vm.me == null -> LoginScreen(vm)
        else -> AppHost(vm)
    }
}

@Composable
private fun UpdateDialog(vm: AppViewModel) {
    if (vm.update == null) return
    val downloading = vm.updateProgress >= 0
    AlertDialog(
        onDismissRequest = { if (!downloading) vm.update = null },
        title = { Text("Update available") },
        text = {
            Text(
                if (downloading) "Downloading... " + vm.updateProgress + "%"
                else "A new version of Aspire Science Academy is ready. Update now?"
            )
        },
        confirmButton = { TextButton(onClick = { vm.startUpdate() }, enabled = !downloading) { Text("Update") } },
        dismissButton = { if (!downloading) TextButton(onClick = { vm.update = null }) { Text("Later") } }
    )
}

@Composable
private fun AppHost(vm: AppViewModel) {
    BackHandler(enabled = vm.stack.size > 1) { vm.back() }
    BackHandler(enabled = vm.stack.size <= 1 && vm.tab != 0) { vm.tab = 0 }

    when (val s = vm.current) {
        is Screen.Main -> MainScreen(vm)
        is Screen.People -> PeopleScreen(vm, s.role)
        is Screen.UserEdit -> UserEditScreen(vm, s)
        is Screen.UserDetail -> UserDetailScreen(vm, s.userId)
        is Screen.BatchEdit -> BatchEditScreen(vm, s.batchId)
        is Screen.BatchDetail -> BatchDetailScreen(vm, s.batchId)
        is Screen.ClassDetail -> ClassDetailScreen(vm, s.classId)
        is Screen.ClassEdit -> ClassEditScreen(vm, s)
        is Screen.ExamEdit -> ExamEditScreen(vm, s.examId)
        is Screen.ExamDetail -> ExamDetailScreen(vm, s.examId)
        is Screen.FeeAdd -> FeeAddScreen(vm, s)
        is Screen.Approvals -> ApprovalsScreen(vm)
        is Screen.TeacherReport -> TeacherReportScreen(vm)
        is Screen.Notices -> NoticesScreen(vm)
        is Screen.NoticeAdd -> NoticeAddScreen(vm)
        is Screen.HomeworkList -> HomeworkListScreen(vm)
        is Screen.HomeworkAdd -> HomeworkAddScreen(vm)
        is Screen.ChangePassword -> ChangePasswordScreen(vm)
    }

    val msg = vm.banner
    if (msg != null) {
        AlertDialog(
            onDismissRequest = { vm.banner = null },
            title = { Text("Problem") },
            text = { Text(msg) },
            confirmButton = { TextButton(onClick = { vm.banner = null }) { Text("OK") } }
        )
    }
}
