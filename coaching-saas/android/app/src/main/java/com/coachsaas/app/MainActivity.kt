package com.coachsaas.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
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
import com.coachsaas.app.data.Repo
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.Screen
import com.coachsaas.app.ui.auth.LoginScreen
import com.coachsaas.app.ui.auth.RegisterInstituteScreen
import com.coachsaas.app.ui.auth.pendingLinkEmail
import com.coachsaas.app.ui.batch.BatchDetailScreen
import com.coachsaas.app.ui.batch.BatchEditScreen
import com.coachsaas.app.ui.exam.ExamDetailScreen
import com.coachsaas.app.ui.exam.ExamEditScreen
import com.coachsaas.app.ui.fees.FeeAddScreen
import com.coachsaas.app.ui.main.ChangePasswordScreen
import com.coachsaas.app.ui.main.MainScreen
import com.coachsaas.app.ui.notice.HomeworkAddScreen
import com.coachsaas.app.ui.notice.HomeworkListScreen
import com.coachsaas.app.ui.notice.NoticeAddScreen
import com.coachsaas.app.ui.notice.NoticesScreen
import com.coachsaas.app.ui.people.PeopleScreen
import com.coachsaas.app.ui.people.UserDetailScreen
import com.coachsaas.app.ui.people.UserEditScreen
import com.coachsaas.app.ui.schedule.ApprovalsScreen
import com.coachsaas.app.ui.student.LeaderboardScreen
import com.coachsaas.app.ui.schedule.ClassDetailScreen
import com.coachsaas.app.ui.schedule.ClassEditScreen
import com.coachsaas.app.ui.schedule.TeacherReportScreen
import com.coachsaas.app.ui.theme.CoachTheme

class MainActivity : ComponentActivity() {
    private val vm: AppViewModel by viewModels()

    /** The owner's e-mail sign-in link opens the app: finish the sign-in with the e-mail typed on the login screen. */
    private fun handleLink(intent: android.content.Intent?) {
        val link = intent?.data?.toString() ?: return
        if (Repo.ready && Repo.isEmailLink(link)) vm.loginWithEmailLink(pendingLinkEmail(this), link)
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        handleLink(intent)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        if (savedInstanceState == null) handleLink(intent)
        if (android.os.Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 1)
        }
        setContent {
            CoachTheme {
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
    when {
        vm.booting -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        vm.needsRegistration -> RegisterInstituteScreen(vm)
        vm.me == null -> LoginScreen(vm)
        else -> AppHost(vm)
    }
}

@Composable
private fun AppHost(vm: AppViewModel) {
    BackHandler(enabled = vm.stack.size > 1) { vm.back() }
    BackHandler(enabled = vm.stack.size <= 1 && vm.tab != 0) { vm.tab = 0 }

    Box(Modifier.fillMaxSize()) {
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
        is Screen.ExamDetail -> ExamDetailScreen(vm, s.examId, s.studentId)
        is Screen.FeeAdd -> FeeAddScreen(vm, s)
        is Screen.Approvals -> ApprovalsScreen(vm)
        is Screen.TeacherReport -> TeacherReportScreen(vm)
        is Screen.Notices -> NoticesScreen(vm)
        is Screen.NoticeAdd -> NoticeAddScreen(vm)
        is Screen.HomeworkList -> HomeworkListScreen(vm)
        is Screen.HomeworkAdd -> HomeworkAddScreen(vm)
        is Screen.Leaderboard -> LeaderboardScreen(vm)
        is Screen.Materials -> com.coachsaas.app.ui.study.MaterialsScreen(vm)
        is Screen.MaterialAdd -> com.coachsaas.app.ui.study.MaterialAddScreen(vm)
        is Screen.Doubts -> com.coachsaas.app.ui.study.DoubtsScreen(vm)
        is Screen.DoubtAsk -> com.coachsaas.app.ui.study.DoubtAskScreen(vm)
        is Screen.DoubtDetail -> com.coachsaas.app.ui.study.DoubtDetailScreen(vm, s.id)
        is Screen.Leaves -> com.coachsaas.app.ui.leave.LeavesScreen(vm)
        is Screen.LeaveApply -> com.coachsaas.app.ui.leave.LeaveApplyScreen(vm)
        is Screen.LeaveRequests -> com.coachsaas.app.ui.leave.LeaveRequestsScreen(vm)
        is Screen.SubjectsEdit -> com.coachsaas.app.ui.main.SubjectsScreen(vm)
        is Screen.Accounts -> com.coachsaas.app.ui.fees.AccountsScreen(vm)
        is Screen.LedgerAdd -> com.coachsaas.app.ui.fees.LedgerAddScreen(vm)
        is Screen.MessageTexts -> com.coachsaas.app.ui.main.MessageTextsScreen(vm)
        is Screen.ChangePassword -> ChangePasswordScreen(vm)
        is Screen.DailyTimetable -> com.coachsaas.app.ui.schedule.DailyTimetableScreen(vm)
        is Screen.TimetableReview -> com.coachsaas.app.ui.schedule.TimetableReviewScreen(vm)
        is Screen.ShareTimetable -> com.coachsaas.app.ui.schedule.ShareTimetableScreen(vm)
        is Screen.Plans -> com.coachsaas.app.ui.main.PlansScreen(vm)
        is Screen.Credentials -> com.coachsaas.app.ui.people.CredentialsScreen(vm)
        is Screen.Structure -> com.coachsaas.app.ui.main.StructureScreen(vm)
        is Screen.FeeSettings -> com.coachsaas.app.ui.fees.FeeSettingsScreen(vm)
        is Screen.Collection -> com.coachsaas.app.ui.fees.CollectionScreen(vm)
        is Screen.Activity -> com.coachsaas.app.ui.fees.ActivityScreen(vm)
    }
    if (vm.busy) {
        androidx.compose.material3.LinearProgressIndicator(Modifier.fillMaxWidth().align(Alignment.TopCenter))
    }
    }

    val working = vm.progress
    if (working != null) {
        AlertDialog(
            onDismissRequest = {},
            title = { Text("Please wait") },
            text = { Text(working + "\n\nThis can take a minute. Keep the app open.") },
            confirmButton = {}
        )
    }

    val report = vm.notice
    if (report != null) {
        AlertDialog(
            onDismissRequest = { vm.notice = null },
            title = { Text("Import finished") },
            text = { Text(report) },
            confirmButton = { TextButton(onClick = { vm.notice = null }) { Text("OK") } }
        )
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
