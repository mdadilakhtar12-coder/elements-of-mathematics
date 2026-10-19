package com.aspirescience.academy.ui.student

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.EmptyState
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PickerField
import com.aspirescience.academy.ui.theme.Amber
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo

@Composable
fun LeaderboardScreen(vm: AppViewModel) {
    val me = vm.me ?: return
    val boards = when (me.role) {
        Role.STUDENT -> vm.leaderboards.filter { it.id in me.batchIds }
        Role.TEACHER -> vm.leaderboards.filter { b -> vm.myBatches.any { it.id == b.id } }
        else -> vm.leaderboards
    }.sortedBy { it.batchName }
    var sel by remember { mutableStateOf("") }
    val board = boards.firstOrNull { it.id == sel } ?: boards.firstOrNull()

    Page("Leaderboard", vm::back) {
        if (board == null) {
            EmptyState("The leaderboard appears after exam marks are saved.")
        } else {
            val top = board.entries.take(10)
            val myIndex = board.entries.indexOfFirst { it.studentId == me.id }
            LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 32.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (boards.size > 1) {
                    item {
                        PickerField("Batch", board.batchName, boards.map { it.id to it.batchName }, { sel = it })
                    }
                }
                item { Text("Ranked by average percentage across all exams", color = Grey, fontSize = 12.sp) }
                itemsIndexed(top) { i, e ->
                    val mine = e.studentId == me.id
                    val medal = when (i) { 0 -> Amber; 1 -> Color(0xFF9CA3AF); 2 -> Color(0xFFB45309); else -> Indigo }
                    AppCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.size(34.dp).background(medal.copy(alpha = 0.18f), CircleShape), contentAlignment = Alignment.Center) {
                                Text((i + 1).toString(), color = medal, fontWeight = FontWeight.Bold)
                            }
                            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                                Text(e.name + if (mine) " (you)" else "", fontWeight = if (mine) FontWeight.Bold else FontWeight.SemiBold)
                                Text(e.exams.toString() + " exams", color = Grey, fontSize = 12.sp)
                            }
                            Text(Math.round(e.pct).toString() + "%", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Indigo)
                        }
                    }
                }
                if (me.role == Role.STUDENT && myIndex >= 10) {
                    val e = board.entries[myIndex]
                    item {
                        AppCard {
                            Text("Your rank: #" + (myIndex + 1) + " of " + board.entries.size, fontWeight = FontWeight.Bold)
                            Text("Average " + Math.round(e.pct) + "%", color = Grey, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }
}
