package com.aspirescience.academy.ui.common

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo

/** Line chart of percentages (0..100) with one labelled point per entry. */
@Composable
fun TrendChart(points: List<Pair<String, Double>>, color: Color = Indigo) {
    val grid = Color(0xFFE3E5F0)
    Column(Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth().height(130.dp)) {
            Column(Modifier.fillMaxHeight().padding(end = 6.dp), verticalArrangement = Arrangement.SpaceBetween) {
                listOf("100", "50", "0").forEach { Text(it, fontSize = 10.sp, color = Grey) }
            }
            Canvas(Modifier.fillMaxSize()) {
                val w = size.width
                val h = size.height
                val pad = 10.dp.toPx()
                listOf(0f, 0.5f, 1f).forEach { f ->
                    val y = h * (1f - f)
                    drawLine(grid, Offset(0f, y), Offset(w, y), 1.dp.toPx())
                }
                val xs = points.indices.map { i ->
                    if (points.size == 1) w / 2f else pad + (w - 2 * pad) * i / (points.size - 1)
                }
                val ys = points.map { (h * (1f - (it.second.coerceIn(0.0, 100.0) / 100.0).toFloat())) }
                for (i in 0 until points.size - 1) {
                    drawLine(color, Offset(xs[i], ys[i]), Offset(xs[i + 1], ys[i + 1]), 3.dp.toPx())
                }
                for (i in points.indices) {
                    drawCircle(Color.White, 6.dp.toPx(), Offset(xs[i], ys[i]))
                    drawCircle(color, 4.5.dp.toPx(), Offset(xs[i], ys[i]))
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(start = 26.dp, top = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            points.forEach { Text(it.first, fontSize = 10.sp, color = Grey) }
        }
        Row(Modifier.fillMaxWidth().padding(start = 26.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            points.forEach { Text(Math.round(it.second).toString() + "%", fontSize = 10.sp, color = color) }
        }
    }
}

/** Vertical bars for percentages (0..100). */
@Composable
fun BarChart(bars: List<Pair<String, Int>>, color: (Int) -> Color) {
    Row(Modifier.fillMaxWidth().height(150.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        bars.forEach { (label, value) ->
            Column(Modifier.weight(1f).fillMaxHeight(), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("$value%", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface)
                Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.BottomCenter) {
                    Box(
                        Modifier.fillMaxWidth(0.6f).fillMaxHeight(value.coerceIn(2, 100) / 100f)
                            .background(color(value), RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
                    )
                }
                Text(label, fontSize = 10.sp, color = Grey)
            }
        }
    }
}
