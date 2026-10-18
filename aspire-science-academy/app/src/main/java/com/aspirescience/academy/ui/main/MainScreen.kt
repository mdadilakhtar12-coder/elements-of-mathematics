@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.main

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
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.BuildConfig
import com.aspirescience.academy.data.Perm
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.Screen
import com.aspirescience.academy.ui.batch.BatchesTab
import com.aspirescience.academy.ui.common.AppBar
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.exam.ExamsTab
import com.aspirescience.academy.ui.fees.FeesTab
import com.aspirescience.academy.ui.fees.StudentFeesTab
import com.aspirescience.academy.ui.notice.HomeworkContent
import com.aspirescience.academy.ui.schedule.ScheduleTab
import com.aspirescience.academy.ui.student.AttendanceContent
import com.aspirescience.academy.ui.student.ResultsContent

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
        )
        Role.STUDENT -> listOf(
            home,
            TabDef("schedule", "Timetable", Icons.Filled.Today),
            TabDef("attendance", "Attendance", Icons.Filled.FactCheck),
            TabDef("results", "Results", Icons.Filled.Quiz),
            TabDef("fees", "Fees", Icons.Filled.AccountBalanceWallet)
        )
        else -> {
            val l = arrayListOf(home)
            if (vm.can(Perm.BATCHES)) l.add(TabDef("batches", "Batches", Icons.Filled.Groups))
            if (vm.can(Perm.SCHEDULE) || vm.can(Perm.ATTENDANCE)) l.add(TabDef("schedule", "Schedule", Icons.Filled.Today))
            if (vm.can(Perm.EXAMS)) l.add(TabDef("exams", "Exams", Icons.Filled.Quiz))
            if (vm.can(Perm.FEES)) l.add(TabDef("fees", "Fees", Icons.Filled.AccountBalanceWallet))
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
                    DropdownMenuItem(
                        text = { Text("Change password") },
                        leadingIcon = { Icon(Icons.Filled.Lock, null) },
                        onClick = { menu = false; vm.go(Screen.ChangePassword) }
                    )
                    DropdownMenuItem(
                        text = { Text("Check for updates (v" + BuildConfig.VERSION_NAME + ")") },
                        leadingIcon = { Icon(Icons.Filled.Download, null) },
                        onClick = { menu = false; vm.checkUpdate(true) }
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
        Box(Modifier.padding(pad).fillMaxSize()) {
            when (cur.key) {
                "home" -> when (me.role) {
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

@Composable
fun ChangePasswordScreen(vm: AppViewModel) {
    var cur by remember { mutableStateOf("") }
    var new1 by remember { mutableStateOf("") }
    var new2 by remember { mutableStateOf("") }
    Page("Change Password", vm::back) {
        FormColumn {
            Field("Current password", cur, { cur = it }, password = true)
            Field("New password (min 6 characters)", new1, { new1 = it }, password = true)
            Field("Repeat new password", new2, { new2 = it }, password = true)
            PrimaryButton("Change password", onClick = {
                if (new1.length < 6) vm.toast("Password must be at least 6 characters")
                else if (new1 != new2) vm.toast("Passwords do not match")
                else vm.changeOwnPassword(cur, new1) { vm.back() }
            }, busy = vm.busy)
        }
    }
}
