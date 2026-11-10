@file:OptIn(ExperimentalMaterial3Api::class)

package com.coachsaas.app.ui.main

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import com.coachsaas.app.ui.common.Segmented
import androidx.compose.ui.unit.dp

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.FactCheck
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Quiz
import androidx.compose.material.icons.filled.Today
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.sp
import com.coachsaas.app.AppConfig
import com.coachsaas.app.BuildConfig
import com.coachsaas.app.data.Feature
import com.coachsaas.app.data.Perm
import com.coachsaas.app.data.Repo
import com.coachsaas.app.data.Role
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.Screen
import com.coachsaas.app.ui.batch.BatchesTab
import com.coachsaas.app.ui.common.AppBar
import com.coachsaas.app.ui.common.FormColumn
import com.coachsaas.app.ui.common.Field
import com.coachsaas.app.ui.common.Page
import com.coachsaas.app.ui.common.PrimaryButton
import com.coachsaas.app.ui.exam.ExamsTab
import com.coachsaas.app.ui.fees.FeesTab
import com.coachsaas.app.ui.fees.StudentFeesTab
import com.coachsaas.app.ui.notice.HomeworkContent
import com.coachsaas.app.ui.schedule.ScheduleTab
import com.coachsaas.app.ui.student.AttendanceContent
import com.coachsaas.app.ui.student.ResultsContent

private class TabDef(val key: String, val title: String, val icon: ImageVector)

private fun tabsFor(vm: AppViewModel): List<TabDef> {
    val home = TabDef("home", "Home", Icons.Filled.Home)
    return when (vm.role) {
        Role.TEACHER -> listOf(
            home,
            TabDef("schedule", "Classes", Icons.Filled.Today),
            TabDef("homework", "Homework", Icons.Filled.Description),
            TabDef("exams", "Exams", Icons.Filled.Quiz),
            TabDef("profile", "Me", Icons.Filled.Person)
        ).filter { it.key != "exams" || vm.has(Feature.EXAMS) }
        Role.STUDENT -> listOf(
            home,
            TabDef("schedule", "Timetable", Icons.Filled.Today),
            TabDef("attendance", "Attendance", Icons.Filled.FactCheck),
            TabDef("results", "Results", Icons.Filled.Quiz),
            TabDef("fees", "Fees", Icons.Filled.AccountBalanceWallet)
        ).filter { (it.key != "results" || vm.has(Feature.EXAMS)) && (it.key != "fees" || vm.has(Feature.FEES)) }
        else -> {
            val l = arrayListOf(home)
            if (vm.can(Perm.BATCHES)) l.add(TabDef("batches", "Batches", Icons.Filled.Groups))
            if (vm.can(Perm.SCHEDULE) || vm.can(Perm.ATTENDANCE)) l.add(TabDef("schedule", "Schedule", Icons.Filled.Today))
            if (vm.can(Perm.EXAMS) && vm.has(Feature.EXAMS)) l.add(TabDef("exams", "Exams", Icons.Filled.Quiz))
            if (vm.can(Perm.FEES) && vm.has(Feature.FEES)) l.add(TabDef("fees", "Fees", Icons.Filled.AccountBalanceWallet))
            l
        }
    }
}

@Composable
fun MainScreen(vm: AppViewModel) {
    val me = vm.me ?: return
    val tabs = tabsFor(vm)
    val cur = tabs[vm.tab.coerceIn(0, tabs.size - 1)]
    var menu by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            AppBar(if (cur.key == "home") AppConfig.APP_NAME else cur.title, null) {
                IconButton(onClick = { menu = true }) { Icon(Icons.Filled.MoreVert, "Menu") }
                DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                    // Owners who sign in with Google / an e-mail link have no password here.
                    if (Repo.hasPassword()) {
                        DropdownMenuItem(
                            text = { Text("Change password") },
                            leadingIcon = { Icon(Icons.Filled.Lock, null) },
                            onClick = { menu = false; vm.go(Screen.ChangePassword) }
                        )
                    }
                    DropdownMenuItem(
                        text = { Text("Version " + BuildConfig.VERSION_NAME) },
                        leadingIcon = { Icon(Icons.Filled.Download, null) },
                        onClick = { menu = false }
                    )
                    DropdownMenuItem(
                        text = { Text("Log out") },
                        leadingIcon = { Icon(Icons.AutoMirrored.Filled.Logout, null) },
                        onClick = { menu = false; vm.logout() }
                    )
                }
            }
        },
        bottomBar = {
            if (tabs.size > 1) {
                NavigationBar(containerColor = Color.White) {
                    tabs.forEachIndexed { i, t ->
                        NavigationBarItem(
                            selected = t.key == cur.key,
                            onClick = { vm.tab = i },
                            icon = { Icon(t.icon, contentDescription = t.title) },
                            label = { Text(t.title, fontSize = 11.sp) }
                        )
                    }
                }
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { pad ->
        Column(Modifier.padding(pad).fillMaxSize()) {
          // A teacher who is also a sub-admin switches between the two views here.
          if (vm.dual) {
              Box(Modifier.padding(16.dp, 6.dp, 16.dp, 2.dp)) {
                  Segmented(listOf("Teacher view", "Admin view"), if (vm.adminMode) 1 else 0, { vm.switchMode(it == 1) })
              }
          }
          Box(Modifier.weight(1f).fillMaxWidth()) {
            when (cur.key) {
                "home" -> when (vm.role) {
                    Role.TEACHER -> TeacherHome(vm)
                    Role.STUDENT -> StudentHome(vm)
                    else -> AdminHome(vm)
                }
                "batches" -> BatchesTab(vm)
                "schedule" -> ScheduleTab(vm)
                "exams" -> ExamsTab(vm)
                "fees" -> if (me.role == Role.STUDENT) StudentFeesTab(vm) else FeesTab(vm)
                "homework" -> HomeworkContent(vm)
                "profile" -> TeacherProfile(vm)
                "attendance" -> AttendanceContent(vm, me.id)
                "results" -> ResultsContent(vm, me.id)
            }
          }
        }
    }
}

@Composable
fun ChangePasswordScreen(vm: AppViewModel) {
    var cur by remember { mutableStateOf("") }
    var new1 by remember { mutableStateOf("") }
    var new2 by remember { mutableStateOf("") }
    Page("Change Password", vm::back) {
        FormColumn {
            Field("Current password", cur, { cur = it }, password = true)
            Field("New password (min 8 characters)", new1, { new1 = it }, password = true)
            Field("Repeat new password", new2, { new2 = it }, password = true)
            PrimaryButton("Change password", onClick = {
                val problem = com.coachsaas.app.util.Passwords.problem(new1, vm.me?.loginId.orEmpty(), vm.me?.mobile.orEmpty())
                if (problem != null) vm.toast(problem)
                else if (new1 != new2) vm.toast("Passwords do not match")
                else vm.changeOwnPassword(cur, new1) { vm.back() }
            }, busy = vm.busy)
        }
    }
}
