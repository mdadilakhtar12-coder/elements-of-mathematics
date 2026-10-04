package com.elementsofmathematics.app.ui.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.elementsofmathematics.app.data.LocalStore
import com.elementsofmathematics.app.data.PdfMode
import com.elementsofmathematics.app.data.Repository
import com.elementsofmathematics.app.data.Section
import com.elementsofmathematics.app.ui.MainViewModel
import com.elementsofmathematics.app.ui.admin.AdminLoginDialog
import com.elementsofmathematics.app.ui.admin.AppSettingsDialog
import com.elementsofmathematics.app.ui.admin.BannerManagerDialog
import com.elementsofmathematics.app.ui.admin.ChangePasswordDialog
import com.elementsofmathematics.app.ui.admin.ConfirmDialog
import com.elementsofmathematics.app.ui.admin.SectionEditorDialog
import com.elementsofmathematics.app.ui.common.SectionIcon
import com.elementsofmathematics.app.ui.common.StatusBarIcons
import com.elementsofmathematics.app.ui.theme.Purple
import com.elementsofmathematics.app.util.Links
import kotlinx.coroutines.launch

private const val TAPS_TO_OPEN_ADMIN = 5

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(vm: MainViewModel, onOpenSection: (String) -> Unit) {
    val settings by vm.settings.collectAsStateWithLifecycle()
    val banners by vm.banners.collectAsStateWithLifecycle()
    val sections by vm.sections.collectAsStateWithLifecycle()
    val isAdmin by vm.isAdmin.collectAsStateWithLifecycle()
    val loadErrors by vm.loadErrors.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val snackbar = remember { SnackbarHostState() }

    var showPdfMode by remember { mutableStateOf(false) }
    var showLogin by remember { mutableStateOf(false) }
    var showBanners by remember { mutableStateOf(false) }
    var showSettings by remember { mutableStateOf(false) }
    var showPassword by remember { mutableStateOf(false) }
    var editingSection by remember { mutableStateOf<Section?>(null) }
    var deletingSection by remember { mutableStateOf<Section?>(null) }

    // Hidden admin entry: tap the title 5 times quickly.
    var tapCount by remember { mutableIntStateOf(0) }
    var lastTap by remember { mutableLongStateOf(0L) }
    val onTitleTap = {
        val now = System.currentTimeMillis()
        tapCount = if (now - lastTap < 800) tapCount + 1 else 1
        lastTap = now
        if (tapCount >= TAPS_TO_OPEN_ADMIN) {
            tapCount = 0
            if (isAdmin) vm.showMessage("You are already in Admin Mode") else showLogin = true
        }
    }

    LaunchedEffect(Unit) { vm.messages.collect { snackbar.showSnackbar(it) } }
    StatusBarIcons(dark = false)

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            AppDrawer(
                title = settings.appTitle,
                isAdmin = isAdmin,
                moreApps = settings.moreApps.map { it.title to it.url },
                onAction = { action ->
                    scope.launch { drawerState.close() }
                    when (action) {
                        DrawerAction.PdfMode -> showPdfMode = true
                        DrawerAction.Feedback -> Links.sendFeedback(context, settings.feedbackEmail, settings.appTitle)
                        DrawerAction.Share -> Links.shareApp(context, settings.appTitle)
                        DrawerAction.Rate -> Links.rateApp(context)
                        DrawerAction.Banners -> showBanners = true
                        DrawerAction.Settings -> showSettings = true
                        DrawerAction.Password -> showPassword = true
                        DrawerAction.Logout -> {
                            Repository.adminLogout()
                            vm.showMessage("Logged out of Admin Mode")
                        }
                        is DrawerAction.OpenLink -> Links.open(context, action.url)
                    }
                },
            )
        },
    ) {
        Scaffold(
            snackbarHost = { SnackbarHost(snackbar) },
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            settings.appTitle,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null,
                                onClick = onTitleTap,
                            ),
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(Icons.Default.Menu, contentDescription = "Menu")
                        }
                    },
                    actions = {
                        if (isAdmin) {
                            Icon(
                                Icons.Default.AdminPanelSettings,
                                contentDescription = "Admin Mode",
                                tint = Color(0xFFFFD54F),
                            )
                        }
                        IconButton(onClick = { showPdfMode = true }) {
                            Icon(Icons.Default.Edit, contentDescription = "PDF mode", tint = Color(0xFFFFC107))
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Purple,
                        titleContentColor = Color.White,
                        navigationIconContentColor = Color.White,
                        actionIconContentColor = Color.White,
                    ),
                )
            },
        ) { padding ->
            val list = sections
            LazyVerticalGrid(
                columns = GridCells.Fixed(3),
                contentPadding = PaddingValues(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
            ) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    BannerCarousel(banners, settings.bannerIntervalSec, isAdmin) { showBanners = true }
                }
                val homeError = loadErrors.entries.firstOrNull { !it.key.startsWith("content:") }?.value
                if (homeError != null) {
                    item(span = { GridItemSpan(maxLineSpan) }) {
                        Text(homeError, color = Color(0xFFD32F2F), modifier = Modifier.padding(16.dp))
                    }
                }
                when {
                    list == null -> item(span = { GridItemSpan(maxLineSpan) }) {
                        Box(Modifier.fillMaxWidth().padding(48.dp), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator()
                        }
                    }

                    list.isEmpty() && !isAdmin -> item(span = { GridItemSpan(maxLineSpan) }) {
                        Text(
                            "Content is coming soon. Please check back later!",
                            textAlign = TextAlign.Center,
                            color = Color.Gray,
                            modifier = Modifier.padding(48.dp),
                        )
                    }

                    else -> {
                        itemsIndexed(list, key = { _, s -> s.id }) { index, section ->
                            SectionCard(
                                section = section,
                                isAdmin = isAdmin,
                                onClick = { onOpenSection(section.id) },
                                onEdit = { editingSection = section },
                                onDelete = { deletingSection = section },
                                onMoveUp = { vm.move(list, index, -1, { Repository.sectionPath(it.id) }, { it.order }) },
                                onMoveDown = { vm.move(list, index, 1, { Repository.sectionPath(it.id) }, { it.order }) },
                            )
                        }
                        if (isAdmin) {
                            item { AddCard("Add Section") { editingSection = Section() } }
                            if (list.isEmpty()) {
                                item(span = { GridItemSpan(maxLineSpan) }) {
                                    Button(
                                        onClick = { vm.run("Default sections added") { Repository.addDefaultSections() } },
                                        modifier = Modifier.padding(top = 8.dp),
                                    ) { Text("Add default sections (NCERT, Notes, Videos…)") }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showPdfMode) PdfModeDialog { showPdfMode = false }
    if (showLogin) {
        AdminLoginDialog(
            onDismiss = { showLogin = false },
            onSuccess = {
                showLogin = false
                vm.showMessage("Admin Mode enabled")
            },
        )
    }
    if (showBanners) BannerManagerDialog(vm, banners, settings) { showBanners = false }
    if (showSettings) {
        AppSettingsDialog(
            settings = settings,
            onDismiss = { showSettings = false },
            onSave = {
                showSettings = false
                vm.run("Settings saved") { Repository.saveSettings(it) }
            },
        )
    }
    if (showPassword) {
        ChangePasswordDialog(
            onDismiss = { showPassword = false },
            onSave = {
                showPassword = false
                vm.run("Password changed") { Repository.changeAdminPassword(it) }
            },
        )
    }
    editingSection?.let { section ->
        SectionEditorDialog(
            section = section,
            onDismiss = { editingSection = null },
            onSave = { updated ->
                editingSection = null
                vm.run("Section saved") { Repository.saveSection(updated, vm.nextOrder(sections) { it.order }) }
            },
        )
    }
    deletingSection?.let { section ->
        ConfirmDialog(
            title = "Delete \"${section.title}\"?",
            message = "This also deletes everything inside this section. This cannot be undone.",
            onDismiss = { deletingSection = null },
            onConfirm = {
                deletingSection = null
                vm.run("Section deleted") { Repository.deleteSection(section) }
            },
        )
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun SectionCard(
    section: Section,
    isAdmin: Boolean,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
) {
    var menu by remember { mutableStateOf(false) }
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        modifier = Modifier
            .fillMaxWidth()
            .height(132.dp)
            .combinedClickable(onClick = onClick, onLongClick = { if (isAdmin) menu = true }),
    ) {
        Box(Modifier.fillMaxSize()) {
            Column(
                Modifier
                    .fillMaxSize()
                    .padding(8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                SectionIcon(section.icon, 52.dp)
                Spacer(Modifier.height(10.dp))
                Text(
                    section.title,
                    textAlign = TextAlign.Center,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    lineHeight = 17.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    color = Color(0xFF222222),
                )
            }
            if (isAdmin) {
                Box(Modifier.align(Alignment.TopEnd)) {
                    IconButton(onClick = { menu = true }, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.MoreVert, contentDescription = "Options", tint = Color.Gray)
                    }
                    AdminItemMenu(menu, { menu = false }, onEdit, onDelete, onMoveUp, onMoveDown, "Move left", "Move right")
                }
            }
        }
    }
}

@Composable
fun AdminItemMenu(
    expanded: Boolean,
    onDismiss: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    upLabel: String = "Move up",
    downLabel: String = "Move down",
) {
    DropdownMenu(expanded = expanded, onDismissRequest = onDismiss) {
        DropdownMenuItem(text = { Text("Edit") }, leadingIcon = { Icon(Icons.Default.Edit, null) }, onClick = { onDismiss(); onEdit() })
        DropdownMenuItem(text = { Text(upLabel) }, leadingIcon = { Icon(Icons.Default.ArrowUpward, null) }, onClick = { onDismiss(); onMoveUp() })
        DropdownMenuItem(text = { Text(downLabel) }, leadingIcon = { Icon(Icons.Default.ArrowDownward, null) }, onClick = { onDismiss(); onMoveDown() })
        DropdownMenuItem(
            text = { Text("Delete", color = Color(0xFFD32F2F)) },
            leadingIcon = { Icon(Icons.Default.Delete, null, tint = Color(0xFFD32F2F)) },
            onClick = { onDismiss(); onDelete() },
        )
    }
}

@Composable
fun AddCard(label: String, height: Int = 132, onClick: () -> Unit) {
    OutlinedCard(
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(2.dp, Purple.copy(alpha = 0.35f)),
        modifier = Modifier
            .fillMaxWidth()
            .height(height.dp)
            .clickable(onClick = onClick),
    ) {
        Column(
            Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Icon(Icons.Default.Add, null, tint = Purple, modifier = Modifier.size(36.dp))
            Text(label, color = Purple, fontWeight = FontWeight.Medium, textAlign = TextAlign.Center)
        }
    }
}

private sealed interface DrawerAction {
    data object PdfMode : DrawerAction
    data object Feedback : DrawerAction
    data object Share : DrawerAction
    data object Rate : DrawerAction
    data object Banners : DrawerAction
    data object Settings : DrawerAction
    data object Password : DrawerAction
    data object Logout : DrawerAction
    data class OpenLink(val url: String) : DrawerAction
}

@Composable
private fun AppDrawer(
    title: String,
    isAdmin: Boolean,
    moreApps: List<Pair<String, String>>,
    onAction: (DrawerAction) -> Unit,
) {
    ModalDrawerSheet {
        Column(Modifier.verticalScroll(rememberScrollState())) {
            Text(
                title,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(start = 24.dp, end = 24.dp, top = 28.dp, bottom = 16.dp),
            )
            DrawerRow(Icons.Default.Edit, Color(0xFFFFC107), "Normal / Highlighter Mode") { onAction(DrawerAction.PdfMode) }
            DrawerRow(Icons.Default.Email, Color(0xFFEA4335), "Feedback") { onAction(DrawerAction.Feedback) }
            DrawerRow(Icons.Default.Share, Color(0xFF00BCD4), "Share App") { onAction(DrawerAction.Share) }
            DrawerRow(Icons.Default.Star, Color(0xFFFFB300), "Rate Us: It motivates us") { onAction(DrawerAction.Rate) }

            if (moreApps.isNotEmpty()) {
                HorizontalDivider(Modifier.padding(vertical = 8.dp))
                Text("More Apps", color = Color.Gray, modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp))
                moreApps.forEach { (name, url) ->
                    DrawerRow(Icons.Default.PlayArrow, Color(0xFF34A853), name) { onAction(DrawerAction.OpenLink(url)) }
                }
            }

            if (isAdmin) {
                HorizontalDivider(Modifier.padding(vertical = 8.dp))
                Text("Admin", color = Purple, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 24.dp, vertical = 8.dp))
                DrawerRow(Icons.Default.PhotoLibrary, Purple, "Manage Banners") { onAction(DrawerAction.Banners) }
                DrawerRow(Icons.Default.Settings, Purple, "App Settings") { onAction(DrawerAction.Settings) }
                DrawerRow(Icons.Default.Key, Purple, "Change Admin Password") { onAction(DrawerAction.Password) }
                DrawerRow(Icons.Default.Logout, Color(0xFFD32F2F), "Exit Admin Mode") { onAction(DrawerAction.Logout) }
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun DrawerRow(icon: ImageVector, tint: Color, label: String, onClick: () -> Unit) {
    NavigationDrawerItem(
        label = { Text(label) },
        icon = { Icon(icon, null, tint = tint) },
        selected = false,
        onClick = onClick,
        modifier = Modifier.padding(horizontal = 12.dp),
    )
}

@Composable
private fun PdfModeDialog(onDismiss: () -> Unit) {
    var mode by remember { mutableStateOf(LocalStore.pdfMode) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Default PDF Mode") },
        text = {
            Column {
                listOf(PdfMode.NORMAL to "Normal Reading Mode", PdfMode.HIGHLIGHTER to "Highlighter Mode").forEach { (m, label) ->
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .selectable(selected = mode == m, role = Role.RadioButton) {
                                mode = m
                                LocalStore.pdfMode = m
                                onDismiss()
                            }
                            .padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        RadioButton(selected = mode == m, onClick = null)
                        Spacer(Modifier.width(16.dp))
                        Text(label, fontSize = 17.sp)
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Close") } },
    )
}
