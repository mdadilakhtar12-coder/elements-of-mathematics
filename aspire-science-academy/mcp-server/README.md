# Aspire Academy – MCP server (Claude se academy chalao)

Is server ko Claude (Claude Desktop ya Claude Code) se jod do, phir aap Hindi/English mein bol ke poora kaam kara sakte ho:

> "11th Science Group A ke saare students ki is hafte ki attendance batao"
> "Riya Patel ki fees 1500 UPI se aa gayi, entry kar do"
> "Is mahine ka profit ya loss kya hai? Room rent 25000 aur advertisement 8000 add kar do"
> "Unit Test 1 ke marks ye sheet se daal do" (sheet Claude ko attach karo)
> "Jin bachchon ki fees baaki hai unke parents ke liye message taiyaar karo"

Yeh aapke **computer par** chalta hai (free). Phone ke Claude app se nahi chalega; uske liye baad mein hosted version bana sakte hain.

## Setup (ek baar, 10 minute)

### 1. Node.js
https://nodejs.org se **LTS** version install karo (version 18 ya usse naya).

### 2. Firebase ki key (service account)
1. Firebase Console → apna project → ⚙️ **Project settings** → **Service accounts**
2. **Generate new private key** → ek `.json` file download hogi
3. Use kisi safe jagah rakho, jaise `C:\aspire\key.json` ya `/Users/aap/aspire-key.json`

> ⚠️ Yeh key poore database ki **chaabi** hai. Kisi ko mat do, GitHub par mat daalo, WhatsApp par mat bhejo.

### 3. Server install karo
Terminal / Command Prompt mein is folder mein jao (`aspire-science-academy/mcp-server`) aur chalao:
```
npm install
```

### 4. Claude se jodo

**Claude Desktop:** Settings → Developer → Edit Config. `claude_desktop_config.json` mein yeh likho (path apne hisaab se badlo) aur Claude Desktop dobara kholo:
```json
{
  "mcpServers": {
    "aspire-academy": {
      "command": "node",
      "args": ["C:\\path\\to\\aspire-science-academy\\mcp-server\\src\\index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "C:\\aspire\\key.json",
        "ASPIRE_ADMIN_NAME": "Adil (Admin)"
      }
    }
  }
}
```
**Claude Code:**
```
claude mcp add aspire-academy -e GOOGLE_APPLICATION_CREDENTIALS=/path/key.json -e ASPIRE_ADMIN_NAME="Adil (Admin)" -- node /path/to/aspire-science-academy/mcp-server/src/index.js
```
Claude mein "aspire-academy" ke tools dikhne chahiye. Pehle poochho: *"academy ka overview batao"*.

### Surakshit mode
- `"ASPIRE_READONLY": "1"` env mein daalo to Claude **sirf dekh sakta hai**, kuch badal nahi sakta (20 tools).
- Delete wale kaam (user, batch, exam, fee, classes...) tab tak nahi chalte jab tak Claude aapse poochh kar `confirm=true` na bheje.
- `ASPIRE_ADMIN_NAME` jo likhoge wahi naam entries mein "received by / approved by" mein aayega.

## Kya-kya kar sakta hai (51 tools)

| Kaam | Tools |
|---|---|
| Dekhna | `academy_overview`, `list_students`, `get_student`, `list_teachers`, `get_teacher`, `list_batches`, `get_batch`, `list_classes`, `get_attendance_report`, `list_exams`, `get_exam_results`, `get_leaderboard`, `fees_overview`, `get_student_fees`, `accounts_summary`, `list_content`, `get_login_details`, `get_message_templates` |
| Students / teachers | `create_student`, `create_teacher`, `bulk_import_students`, `update_user`, `reset_password`, `delete_user` |
| Batch aur timetable | `create_batch`, `update_batch`, `delete_batch`, `set_batch_students`, `generate_classes`, `add_class`, `update_class`, `delete_classes` |
| Attendance | `mark_attendance`, `approve_classes` |
| Exams | `create_exam`, `update_exam`, `enter_marks`, `delete_exam` |
| Paisa | `record_fee`, `delete_fee`, `add_ledger_entry`, `delete_ledger_entry`, `mark_teacher_paid` |
| Announcements / padhai | `post_notice`, `post_homework`, `add_material`, `answer_doubt`, `delete_content` |
| Parents ko message | `draft_parent_message` (text + WhatsApp link banata hai, **bhejta nahi**), `set_message_templates` |
| Backup | `export_backup` (poora data JSON files mein, aapke computer par) |

Jo bhi Claude karta hai woh app mein turant dikhta hai (students ko notice/homework ka alert bhi jata hai).

## Dhyan rakho
- Server database mein seedha likhta hai (Firebase rules se upar). Isliye key surakshit rakho.
- **Bill / doubt ki photo** Claude se upload nahi hoti; wo app se hi hoti hai.
- Excel/CSV: Claude ko file attach karo, wo padh ke `bulk_import_students` ya `enter_marks` ko rows de dega.
- Parents ko WhatsApp message apne aap nahi jata. WhatsApp API baad mein jodoge to `draft_parent_message` ke saath send ka tool jod denge.
- Test: `npm test` (logic). Poora test emulator par: `npx firebase-tools emulators:exec --only firestore,auth --project demo-aspire "node test/e2e.js"`
