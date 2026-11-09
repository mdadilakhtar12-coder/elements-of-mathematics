package com.coachsaas.app.ui.auth

import android.app.Activity
import android.content.Context
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
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import com.coachsaas.app.AppConfig
import com.coachsaas.app.data.Repo
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.common.Field
import com.coachsaas.app.ui.common.PrimaryButton
import com.coachsaas.app.ui.common.Segmented
import com.coachsaas.app.ui.theme.Amber
import com.coachsaas.app.ui.theme.Grey
import com.coachsaas.app.ui.theme.Indigo
import com.coachsaas.app.ui.theme.Red
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.launch

private const val PREFS = "coach_login"

/** Pending e-mail for the owner's sign-in link: the link opens the app, which needs the e-mail typed earlier. */
fun pendingLinkEmail(ctx: Context): String = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("link_email", "").orEmpty()

@Composable
fun LoginScreen(vm: AppViewModel) {
    val ctx = LocalContext.current
    val prefs = remember { ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE) }
    var mode by rememberSaveable { mutableIntStateOf(0) }
    Column(
        Modifier.fillMaxSize().systemBarsPadding().imePadding().verticalScroll(rememberScrollState()).padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(16.dp))
        Text(AppConfig.APP_NAME.uppercase(), fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, color = Indigo, letterSpacing = 3.sp)
        Text("COACHING INSTITUTE APP", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Amber, letterSpacing = 3.sp)
        Spacer(Modifier.height(28.dp))
        Segmented(listOf("Staff / Student", "Institute owner"), mode, { mode = it; vm.loginError = null })
        Spacer(Modifier.height(20.dp))
        if (mode == 0) StaffLogin(vm, prefs.getString("code", "").orEmpty()) { prefs.edit().putString("code", it).apply() }
        else OwnerLogin(vm) { prefs.edit().putString("link_email", it).apply() }
        val err = vm.loginError
        if (err != null) Text(err, color = Red, fontSize = 14.sp, modifier = Modifier.padding(top = 12.dp), textAlign = TextAlign.Center)
    }
}

@Composable
private fun StaffLogin(vm: AppViewModel, lastCode: String, rememberCode: (String) -> Unit) {
    var code by rememberSaveable { mutableStateOf(lastCode) }
    var username by rememberSaveable { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Log in", fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Text("Use the institute code, username and password given by your institute admin.", color = Grey, fontSize = 13.sp)
        Field("Institute code", code, { code = it.trim().lowercase() })
        Field("Username / mobile number", username, { username = it.trim() })
        Field("Password", password, { password = it }, password = true)
        PrimaryButton("Login", onClick = {
            rememberCode(code)
            vm.login(code, username, password)
        }, busy = vm.busy)
        Text("Forgot your password? Ask your institute admin to reset it.", color = Grey, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
private fun OwnerLogin(vm: AppViewModel, rememberEmail: (String) -> Unit) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var email by rememberSaveable { mutableStateOf("") }
    var sent by rememberSaveable { mutableStateOf(false) }
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Institute owner", fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Text("Sign in to manage your institute, or to register a new one.", color = Grey, fontSize = 13.sp)
        PrimaryButton("Continue with Google", onClick = {
            scope.launch {
                try {
                    val token = googleIdToken(ctx)
                    vm.loginWithGoogle(token)
                } catch (e: androidx.credentials.exceptions.GetCredentialCancellationException) {
                    // The user closed the sheet.
                } catch (e: Exception) {
                    vm.loginError = e.message ?: "Google sign-in failed"
                }
            }
        }, busy = vm.busy)
        Text("or", color = Grey, modifier = Modifier.align(Alignment.CenterHorizontally))
        Field("E-mail", email, { email = it.trim() }, keyboard = KeyboardType.Email)
        OutlinedButton(
            onClick = {
                rememberEmail(email)
                vm.sendEmailLink(email) { sent = true }
            },
            modifier = Modifier.fillMaxWidth().height(48.dp)
        ) { Text("Email me a sign-in link") }
        if (sent) Text("Link sent. Open it on this phone to finish signing in.", color = Grey, fontSize = 13.sp)
    }
}

/** Shows the Google account picker and returns a Google ID token for Firebase Auth. */
private suspend fun googleIdToken(ctx: Context): String {
    val activity = ctx as? Activity ?: error("Cannot open Google sign-in here")
    val webClientId = ctx.resources.getIdentifier("default_web_client_id", "string", ctx.packageName)
    if (webClientId == 0) error("Google sign-in is not set up: add google-services.json with a web client (see README)")
    val option = GetGoogleIdOption.Builder()
        .setFilterByAuthorizedAccounts(false)
        .setServerClientId(ctx.getString(webClientId))
        .build()
    val result = CredentialManager.create(ctx).getCredential(activity, GetCredentialRequest.Builder().addCredentialOption(option).build())
    val cred = result.credential
    if (cred is CustomCredential && cred.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
        return GoogleIdTokenCredential.createFrom(cred.data).idToken
    }
    error("Unexpected sign-in result")
}

/** Shown after owner sign-in when the account has no institute yet. */
@Composable
fun RegisterInstituteScreen(vm: AppViewModel) {
    var name by rememberSaveable { mutableStateOf("") }
    var code by rememberSaveable { mutableStateOf("") }
    Column(
        Modifier.fillMaxSize().systemBarsPadding().imePadding().verticalScroll(rememberScrollState()).padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("Register your institute", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text(
            "You start on the Free plan (1 admin, 1 sub-admin, 5 teachers, 30 students). Your staff and students log in with the institute code.",
            color = Grey, fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp, bottom = 18.dp)
        )
        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Field("Institute name", name, { name = it })
            Field("Institute code (3-24 letters, digits or -)", code, { code = it.trim().lowercase().filter { c -> c.isLetterOrDigit() || c == '-' } })
            Text("Choose carefully - this code can't be changed later. Example: aspire-science", color = Grey, fontSize = 12.sp)
            val err = vm.loginError
            if (err != null) Text(err, color = Red, fontSize = 14.sp)
            PrimaryButton("Create institute", onClick = { vm.registerInstitute(name, code) }, busy = vm.busy)
            TextButton(onClick = { vm.logout() }, modifier = Modifier.fillMaxWidth()) { Text("Sign out") }
        }
    }
}
