package com.aspirescience.academy.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.theme.Amber
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Red

@Composable
fun LoginScreen(vm: AppViewModel) {
    var id by rememberSaveable { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    Column(
        Modifier.fillMaxSize().systemBarsPadding().imePadding().verticalScroll(rememberScrollState()).padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(24.dp))
        Text("ASPIRE", fontSize = 40.sp, fontWeight = FontWeight.ExtraBold, color = Indigo, letterSpacing = 4.sp)
        Text("SCIENCE ACADEMY", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Amber, letterSpacing = 3.sp)
        Spacer(Modifier.height(36.dp))
        Text("Log In", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text("Use the ID and password given by the academy", color = Grey, fontSize = 13.sp, textAlign = TextAlign.Center)
        Spacer(Modifier.height(24.dp))
        Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Field("Mobile number / User ID", id, { id = it })
            Field("Password", password, { password = it }, password = true)
            val err = vm.loginError
            if (err != null) Text(err, color = Red, fontSize = 14.sp)
            PrimaryButton("Login", onClick = { vm.login(id, password) }, busy = vm.busy)
        }
        Spacer(Modifier.height(24.dp))
        Text("Forgot your password? Ask the academy admin.", color = Grey, fontSize = 12.sp)
    }
}
