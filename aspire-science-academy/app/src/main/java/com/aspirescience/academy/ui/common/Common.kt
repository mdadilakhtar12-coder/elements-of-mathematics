@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.common

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.ui.theme.Green
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Red
import com.aspirescience.academy.util.D
import java.time.LocalDate
import java.time.LocalTime
import java.util.Locale

// ---------- page scaffolding ----------

@Composable
fun AppBar(title: String, onBack: (() -> Unit)? = null, actions: @Composable RowScope.() -> Unit = {}) {
    TopAppBar(
        title = { Text(title, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis) },
        navigationIcon = {
            if (onBack != null) {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") }
            }
        },
        actions = actions,
        colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
    )
}

@Composable
fun Page(
    title: String,
    onBack: (() -> Unit)?,
    actions: @Composable RowScope.() -> Unit = {},
    fab: @Composable () -> Unit = {},
    content: @Composable () -> Unit
) {
    Scaffold(
        topBar = { AppBar(title, onBack, actions) },
        floatingActionButton = fab,
        containerColor = MaterialTheme.colorScheme.background
    ) { pad ->
        Box(Modifier.padding(pad).fillMaxSize()) { content() }
    }
}

@Composable
fun FormColumn(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier.fillMaxSize().imePadding().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        content = content
    )
}

/** Vertical list with the standard padding used by every list screen. */
@Composable
fun <T> ListColumn(items: List<T>, empty: String, modifier: Modifier = Modifier, row: @Composable (T) -> Unit) {
    if (items.isEmpty()) {
        EmptyState(empty)
    } else {
        LazyColumn(
            modifier.fillMaxSize(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp, 12.dp, 16.dp, 90.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(items) { row(it) }
        }
    }
}

// ---------- basic pieces ----------

@Composable
fun AppCard(modifier: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    val shape = RoundedCornerShape(14.dp)
    val colors = CardDefaults.cardColors(containerColor = Color.White)
    val elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    if (onClick != null) {
        Card(onClick = onClick, modifier = modifier.fillMaxWidth(), shape = shape, colors = colors, elevation = elevation) {
            Column(Modifier.padding(14.dp), content = content)
        }
    } else {
        Card(modifier = modifier.fillMaxWidth(), shape = shape, colors = colors, elevation = elevation) {
            Column(Modifier.padding(14.dp), content = content)
        }
    }
}

@Composable
fun SectionTitle(text: String, modifier: Modifier = Modifier) {
    Text(
        text, modifier = modifier.padding(top = 4.dp), fontSize = 16.sp, fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.onSurface
    )
}

@Composable
fun EmptyState(text: String) {
    Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Text(text, color = Grey, textAlign = TextAlign.Center)
    }
}

@Composable
fun Pill(text: String, color: Color) {
    Box(
        Modifier.background(color.copy(alpha = 0.12f), RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 3.dp)
    ) {
        Text(text, color = color, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun Avatar(name: String, size: Int = 40, color: Color = Indigo) {
    Box(
        Modifier.size(size.dp).background(color.copy(alpha = 0.14f), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Text(
            name.trim().take(1).uppercase().ifEmpty { "?" }, color = color,
            fontWeight = FontWeight.Bold, fontSize = (size * 0.42).sp
        )
    }
}

@Composable
fun StatTile(label: String, value: String, color: Color, modifier: Modifier = Modifier, onClick: (() -> Unit)? = null) {
    AppCard(modifier, onClick) {
        Text(value, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = color)
        Text(label, fontSize = 12.sp, color = Grey)
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    if (value.isBlank()) return
    Row(Modifier.fillMaxWidth().padding(vertical = 3.dp)) {
        Text(label, color = Grey, modifier = Modifier.width(110.dp), fontSize = 14.sp)
        Text(value, fontSize = 14.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun PrimaryButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, busy: Boolean = false) {
    Button(
        onClick = onClick, enabled = enabled && !busy,
        modifier = modifier.fillMaxWidth().height(50.dp), shape = RoundedCornerShape(12.dp)
    ) {
        if (busy) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
        else Text(text, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun DangerTextButton(text: String, onClick: () -> Unit) {
    TextButton(onClick = onClick) { Text(text, color = Red) }
}

@Composable
fun ConfirmDialog(title: String, message: String, confirmText: String, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = { Text(message) },
        confirmButton = { TextButton(onClick = { onDismiss(); onConfirm() }) { Text(confirmText, color = Red) } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun Segmented(options: List<String>, selected: Int, onSelect: (Int) -> Unit) {
    Row(
        Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(12.dp)).padding(4.dp)
    ) {
        options.forEachIndexed { i, label ->
            val on = i == selected
            Box(
                Modifier.weight(1f).background(if (on) Color.White else Color.Transparent, RoundedCornerShape(9.dp))
                    .clickable { onSelect(i) }.padding(vertical = 9.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(label, fontWeight = if (on) FontWeight.Bold else FontWeight.Normal, color = if (on) Indigo else Grey)
            }
        }
    }
}

@Composable
fun MonthSwitcher(month: String, onChange: (String) -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
        IconButton(onClick = { onChange(D.shiftMonth(month, -1)) }) { Icon(Icons.Filled.ChevronLeft, "Previous month") }
        Text(D.monthLabel(month), fontSize = 17.sp, fontWeight = FontWeight.Bold, modifier = Modifier.width(120.dp), textAlign = TextAlign.Center)
        IconButton(onClick = { onChange(D.shiftMonth(month, 1)) }) { Icon(Icons.Filled.ChevronRight, "Next month") }
    }
}

// ---------- form fields ----------

@Composable
fun Field(
    label: String,
    value: String,
    onChange: (String) -> Unit,
    modifier: Modifier = Modifier.fillMaxWidth(),
    keyboard: KeyboardType = KeyboardType.Text,
    password: Boolean = false,
    singleLine: Boolean = true,
    enabled: Boolean = true,
    placeholder: String? = null
) {
    var show by remember { mutableStateOf(false) }
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label) },
        modifier = modifier,
        singleLine = singleLine,
        minLines = if (singleLine) 1 else 3,
        enabled = enabled,
        placeholder = placeholder?.let { { Text(it) } },
        keyboardOptions = KeyboardOptions(keyboardType = if (password) KeyboardType.Password else keyboard),
        visualTransformation = if (password && !show) PasswordVisualTransformation() else VisualTransformation.None,
        trailingIcon = if (password) {
            {
                IconButton(onClick = { show = !show }) {
                    Icon(if (show) Icons.Filled.VisibilityOff else Icons.Filled.Visibility, contentDescription = "Show password")
                }
            }
        } else null,
        shape = RoundedCornerShape(12.dp)
    )
}

/** A read-only text field that reacts to taps (used for dropdowns and pickers). */
@Composable
fun ClickField(
    label: String,
    value: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier.fillMaxWidth(),
    icon: ImageVector = Icons.Filled.ArrowDropDown,
    placeholder: String = ""
) {
    Box(modifier) {
        OutlinedTextField(
            value = value, onValueChange = {}, readOnly = true,
            label = { Text(label) },
            placeholder = { Text(placeholder) },
            trailingIcon = { Icon(icon, contentDescription = null) },
            modifier = Modifier.fillMaxWidth(), singleLine = true, shape = RoundedCornerShape(12.dp)
        )
        Box(Modifier.matchParentSize().clickable(onClick = onClick))
    }
}

@Composable
fun DropdownField(
    label: String,
    value: String,
    options: List<String>,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier.fillMaxWidth(),
    placeholder: String = "Select"
) {
    var open by remember { mutableStateOf(false) }
    Box(modifier) {
        ClickField(label, value, { open = true }, placeholder = placeholder)
        DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
            options.forEachIndexed { i, o ->
                DropdownMenuItem(text = { Text(o) }, onClick = { open = false; onSelect(i) })
            }
        }
    }
}

fun pickDate(ctx: Context, current: String, onPick: (String) -> Unit) {
    val d = D.parse(current) ?: LocalDate.now()
    DatePickerDialog(
        ctx, { _, y, m, day -> onPick(LocalDate.of(y, m + 1, day).toString()) },
        d.year, d.monthValue - 1, d.dayOfMonth
    ).show()
}

fun pickTime(ctx: Context, current: String, onPick: (String) -> Unit) {
    val t = try {
        LocalTime.parse(current)
    } catch (e: Exception) {
        LocalTime.of(16, 0)
    }
    TimePickerDialog(
        ctx, { _, h, m -> onPick("%02d:%02d".format(Locale.ENGLISH, h, m)) },
        t.hour, t.minute, false
    ).show()
}

@Composable
fun DateField(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier.fillMaxWidth()) {
    val ctx = LocalContext.current
    ClickField(
        label, if (value.isBlank()) "" else D.pretty(value), { pickDate(ctx, value, onChange) },
        modifier, Icons.Filled.CalendarMonth, "Select date"
    )
}

@Composable
fun TimeField(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier.fillMaxWidth()) {
    val ctx = LocalContext.current
    ClickField(
        label, if (value.isBlank()) "" else D.time12(value), { pickTime(ctx, value, onChange) },
        modifier, Icons.Filled.Schedule, "Select time"
    )
}

/** Opens a searchable list; options are (id, label) pairs. */
@Composable
fun PickerField(
    label: String,
    value: String,
    options: List<Pair<String, String>>,
    onPick: (String) -> Unit,
    modifier: Modifier = Modifier.fillMaxWidth(),
    placeholder: String = "Select",
    enabled: Boolean = true
) {
    var open by remember { mutableStateOf(false) }
    ClickField(label, value, { if (enabled) open = true }, modifier, placeholder = placeholder)
    if (open) {
        PickDialog(label, options, { open = false }, { open = false; onPick(it) })
    }
}

@Composable
fun PickDialog(title: String, options: List<Pair<String, String>>, onDismiss: () -> Unit, onPick: (String) -> Unit) {
    var q by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column {
                if (options.size > 6) {
                    OutlinedTextField(
                        q, { q = it }, placeholder = { Text("Search") }, singleLine = true,
                        modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)
                    )
                    Spacer(Modifier.height(8.dp))
                }
                val shown = options.filter { it.second.contains(q, ignoreCase = true) }
                if (shown.isEmpty()) Text("Nothing found", color = Grey)
                LazyColumn(Modifier.heightIn(max = 340.dp)) {
                    items(shown) { o ->
                        Text(
                            o.second,
                            Modifier.fillMaxWidth().clickable { onPick(o.first) }.padding(vertical = 13.dp)
                        )
                        HorizontalDivider()
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun MultiPickDialog(
    title: String,
    options: List<Pair<String, String>>,
    selected: Set<String>,
    onDismiss: () -> Unit,
    onDone: (Set<String>) -> Unit
) {
    var sel by remember { mutableStateOf(selected) }
    var q by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column {
                if (options.size > 6) {
                    OutlinedTextField(
                        q, { q = it }, placeholder = { Text("Search") }, singleLine = true,
                        modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)
                    )
                    Spacer(Modifier.height(8.dp))
                }
                val shown = options.filter { it.second.contains(q, ignoreCase = true) }
                if (shown.isEmpty()) Text("Nothing found", color = Grey)
                LazyColumn(Modifier.heightIn(max = 340.dp)) {
                    items(shown) { o ->
                        Row(
                            Modifier.fillMaxWidth()
                                .clickable { sel = if (o.first in sel) sel - o.first else sel + o.first }
                                .padding(vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(checked = o.first in sel, onCheckedChange = null)
                            Spacer(Modifier.width(10.dp))
                            Text(o.second)
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = { onDone(sel) }) { Text("Done (" + sel.size + ")") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

/** P / A / L attendance toggle. */
@Composable
fun StatusToggle(current: String, onChange: (String) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        listOf("P" to Green, "A" to Red, "L" to com.aspirescience.academy.ui.theme.Orange).forEach { (code, color) ->
            val on = current == code
            Box(
                Modifier.size(36.dp).background(if (on) color else color.copy(alpha = 0.10f), CircleShape)
                    .clickable { onChange(code) },
                contentAlignment = Alignment.Center
            ) {
                Text(code, color = if (on) Color.White else color, fontWeight = FontWeight.Bold)
            }
        }
    }
}
