package com.aspirescience.academy.ui.main

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.ConfirmDialog
import com.aspirescience.academy.ui.common.DangerTextButton
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.theme.Grey

@Composable
fun DemoScreen(vm: AppViewModel) {
    var confirmLoad by remember { mutableStateOf(false) }
    var confirmRemove by remember { mutableStateOf(false) }
    Page("Demo data", vm::back) {
        FormColumn {
            AppCard {
                Text("Sample data for testing", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(
                    "Creates 5 teachers, 84 students in 5 batches (11th and 12th Science with Group A and B, and 10th), " +
                        "4 weeks of classes, attendance, 3 exams per batch with marks and leaderboards, fee payments, " +
                        "announcements and homework.",
                    color = Grey, fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp)
                )
                Text(
                    "Your own data is not changed or deleted.",
                    fontWeight = FontWeight.SemiBold, fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp)
                )
            }
            AppCard {
                Text("Demo logins (password: demo123)", fontWeight = FontWeight.Bold)
                Column(Modifier.padding(top = 6.dp)) {
                    Text("Teachers: 9000000001 to 9000000005", fontSize = 13.sp)
                    Text("Teacher 1 teaches Physics, 2 Chemistry, 3 Maths, 4 Biology, 5 English", color = Grey, fontSize = 12.sp)
                    Text("Students: 9100000001 to 9100000084", fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp))
                    Text("Log out and log in with these to see the teacher and student screens.", color = Grey, fontSize = 12.sp)
                }
            }
            PrimaryButton("Load demo data", onClick = { confirmLoad = true }, busy = vm.busy)
            DangerTextButton("Remove demo data") { confirmRemove = true }
        }
    }
    if (confirmLoad) {
        ConfirmDialog(
            "Load demo data?", "About 90 demo logins and a lot of sample records will be created. It takes around a minute.",
            "Load", { vm.loadDemo() }, { confirmLoad = false }
        )
    }
    if (confirmRemove) {
        ConfirmDialog(
            "Remove demo data?", "All demo teachers, students, batches and their records will be deleted. Your own data stays.",
            "Remove", { vm.removeDemo() }, { confirmRemove = false }
        )
    }
}
