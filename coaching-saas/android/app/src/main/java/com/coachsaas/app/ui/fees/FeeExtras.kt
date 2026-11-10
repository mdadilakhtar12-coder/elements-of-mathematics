package com.coachsaas.app.ui.fees

import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.coachsaas.app.AppConfig
import com.coachsaas.app.data.FeeSettings
import com.coachsaas.app.data.Repo
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.common.AppCard
import com.coachsaas.app.ui.common.DateField
import com.coachsaas.app.ui.common.Field
import com.coachsaas.app.ui.common.FormColumn
import com.coachsaas.app.ui.common.Page
import com.coachsaas.app.ui.common.PrimaryButton
import com.coachsaas.app.ui.common.SectionTitle
import com.coachsaas.app.ui.common.StatTile
import com.coachsaas.app.ui.theme.Green
import com.coachsaas.app.ui.theme.Grey
import com.coachsaas.app.ui.theme.Indigo
import com.coachsaas.app.util.D
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter

/** A UPI payment link. Money goes straight to the institute's own UPI id; no gateway and no charges. */
fun upiUri(settings: FeeSettings, amount: Long, note: String): String {
    fun enc(s: String) = Uri.encode(s)
    return "upi://pay?pa=" + enc(settings.upiId.trim()) +
        "&pn=" + enc(settings.payeeName.ifBlank { AppConfig.APP_NAME }) +
        (if (amount > 0) "&am=$amount" else "") + "&cu=INR&tn=" + enc(note.take(60))
}

private fun qrBitmap(text: String, size: Int = 600): Bitmap? = try {
    val m = QRCodeWriter().encode(text, BarcodeFormat.QR_CODE, size, size)
    val px = IntArray(size * size) { i -> if (m.get(i % size, i / size)) 0xFF000000.toInt() else 0xFFFFFFFF.toInt() }
    Bitmap.createBitmap(px, size, size, Bitmap.Config.ARGB_8888)
} catch (e: Exception) {
    null
}

@Composable
fun QrCode(text: String, modifier: Modifier = Modifier) {
    val bmp = remember(text) { qrBitmap(text) }
    if (bmp != null) Image(bmp.asImageBitmap(), "UPI QR code", modifier.size(220.dp))
}

/** Student: pay this month's due with any UPI app, or show the QR to scan from another phone. */
@Composable
fun UpiPayCard(vm: AppViewModel, studentName: String, due: Long, month: String) {
    val ctx = LocalContext.current
    var showQr by remember { mutableStateOf(false) }
    val uri = upiUri(vm.feeSettings, due, "Fees " + D.monthLabel(month) + " " + studentName)
    AppCard {
        Text("Pay " + D.rs(due) + " by UPI", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Text("To " + vm.feeSettings.upiId + ". After paying, show the screenshot to your institute so they mark it paid.", color = Grey, fontSize = 12.sp)
        Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = {
                try {
                    ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(uri)))
                } catch (e: ActivityNotFoundException) {
                    vm.toast("No UPI app found on this phone")
                }
            }, modifier = Modifier.weight(1f)) { Text("Open UPI app") }
            OutlinedButton(onClick = { showQr = true }, modifier = Modifier.weight(1f)) { Text("Show QR") }
        }
    }
    if (showQr) {
        AlertDialog(
            onDismissRequest = { showQr = false },
            title = { Text("Scan to pay " + D.rs(due)) },
            text = { Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) { QrCode(uri) } },
            confirmButton = { TextButton(onClick = { showQr = false }) { Text("Close") } }
        )
    }
}

/** Staff with the fees permission: the institute's UPI id shown to students for payment. */
@Composable
fun FeeSettingsScreen(vm: AppViewModel) {
    var upi by remember { mutableStateOf(vm.feeSettings.upiId) }
    var name by remember { mutableStateOf(vm.feeSettings.payeeName) }
    Page("UPI settings", vm::back) {
        FormColumn {
            Text(
                "Enter the institute's UPI ID. Students see a \"Pay by UPI\" button and QR code for their pending fee. " +
                    "The money goes directly to this UPI ID - the app does not handle it, so record the payment here after you receive it.",
                color = Grey, fontSize = 13.sp
            )
            Field("UPI ID (example: name@okhdfcbank)", upi, { upi = it.trim() })
            Field("Account holder / institute name", name, { name = it })
            val ok = upi.isBlank() || Regex("^[A-Za-z0-9._-]{2,}@[A-Za-z0-9.-]{2,}$").matches(upi)
            if (!ok) Text("This does not look like a UPI ID", color = com.coachsaas.app.ui.theme.Red, fontSize = 13.sp)
            if (ok && upi.isNotBlank()) {
                Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Check it: scan this QR and see that the right name appears", color = Grey, fontSize = 12.sp)
                    QrCode(upiUri(FeeSettings(upi, name), 0, "Test"))
                }
            }
            PrimaryButton("Save", onClick = {
                if (!ok) vm.toast("Enter a valid UPI ID or leave it empty")
                else vm.saveFeeSettings(FeeSettings(upi, name.trim())) { vm.back() }
            }, busy = vm.busy)
        }
    }
}

/** Day-wise collection: how much came in, by payment mode and by who received it. */
@Composable
fun CollectionScreen(vm: AppViewModel) {
    var date by remember { mutableStateOf(D.today()) }
    val fees by remember(date) { Repo.feesByDate(date, date) }.collectAsState(initial = emptyList())
    val byMode = fees.groupBy { it.mode }.mapValues { e -> e.value.sumOf { it.amount } }.toList().sortedByDescending { it.second }
    val byPerson = fees.groupBy { it.receivedBy.ifBlank { "-" } }.mapValues { e -> e.value.sumOf { it.amount } }.toList().sortedByDescending { it.second }
    Page("Daily collection", vm::back) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 40.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item { DateField("Date", date, { date = it }) }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Collected", D.rs(fees.sumOf { it.amount }), Green, Modifier.weight(1f))
                    StatTile("Payments", fees.size.toString(), Indigo, Modifier.weight(1f))
                }
            }
            if (fees.isEmpty()) {
                item { Text("No payments were received on this date", color = Grey) }
            } else {
                item {
                    AppCard {
                        Text("By payment mode", fontWeight = FontWeight.Bold)
                        byMode.forEach { (k, v) -> SumRow(k, v) }
                    }
                }
                item {
                    AppCard {
                        Text("Received by", fontWeight = FontWeight.Bold)
                        byPerson.forEach { (k, v) -> SumRow(k, v) }
                    }
                }
                item { SectionTitle("Payments") }
                items(fees.sortedByDescending { it.createdAt }, key = { it.id }) { f ->
                    AppCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(f.studentName, fontWeight = FontWeight.SemiBold)
                                Text(
                                    f.mode + " · " + f.receivedBy + (if (f.receiptNo > 0) " · Receipt #" + f.receiptNo else ""),
                                    color = Grey, fontSize = 13.sp
                                )
                            }
                            Text(D.rs(f.amount), fontWeight = FontWeight.Bold, color = Green)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SumRow(label: String, amount: Long) {
    Row(Modifier.fillMaxWidth().padding(top = 6.dp)) {
        Text(label, modifier = Modifier.weight(1f), fontSize = 14.sp)
        Text(D.rs(amount), fontWeight = FontWeight.Medium, fontSize = 14.sp)
    }
}
