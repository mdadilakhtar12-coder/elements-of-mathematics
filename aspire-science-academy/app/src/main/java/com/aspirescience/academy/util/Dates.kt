package com.aspirescience.academy.util

import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

object D {
    private val EN: Locale = Locale.ENGLISH

    val DAYS = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")

    fun today(): String = LocalDate.now().toString()
    fun daysAgo(n: Long): String = LocalDate.now().minusDays(n).toString()

    fun parse(s: String): LocalDate? = try {
        LocalDate.parse(s)
    } catch (e: Exception) {
        null
    }

    fun pretty(s: String): String =
        parse(s)?.format(DateTimeFormatter.ofPattern("EEE, dd MMM yyyy", EN)) ?: s

    fun shortDate(s: String): String =
        parse(s)?.format(DateTimeFormatter.ofPattern("dd MMM", EN)) ?: s

    fun time12(t: String): String = try {
        LocalTime.parse(t).format(DateTimeFormatter.ofPattern("h:mm a", EN))
    } catch (e: Exception) {
        t
    }

    fun range(a: String, b: String) = time12(a) + " - " + time12(b)

    fun dayName(day: Int): String = DAYS.getOrElse(day - 1) { "" }

    fun monthKey(d: LocalDate): String = d.year.toString() + "-" + d.monthValue.toString().padStart(2, '0')
    fun thisMonth(): String = monthKey(LocalDate.now())

    fun shiftMonth(m: String, n: Long): String {
        val p = m.split("-")
        return monthKey(LocalDate.of(p[0].toInt(), p[1].toInt(), 1).plusMonths(n))
    }

    fun monthLabel(m: String): String = try {
        val p = m.split("-")
        LocalDate.of(p[0].toInt(), p[1].toInt(), 1).format(DateTimeFormatter.ofPattern("MMM yyyy", EN))
    } catch (e: Exception) {
        m
    }

    fun monthStart(m: String): String = "$m-01"

    fun monthEnd(m: String): String {
        val d = LocalDate.parse("$m-01")
        return d.withDayOfMonth(d.lengthOfMonth()).toString()
    }

    fun timestamp(ms: Long): String {
        if (ms <= 0) return ""
        val t = Instant.ofEpochMilli(ms).atZone(ZoneId.systemDefault())
        return t.format(DateTimeFormatter.ofPattern("dd MMM, h:mm a", EN))
    }

    fun monthOfMillis(ms: Long): String =
        monthKey(Instant.ofEpochMilli(ms).atZone(ZoneId.systemDefault()).toLocalDate())

    fun rs(n: Long): String = "₹" + "%,d".format(EN, n)
}
