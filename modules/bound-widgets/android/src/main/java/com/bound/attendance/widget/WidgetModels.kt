package com.bound.attendance.widget

import android.content.Context
import android.content.SharedPreferences
import android.database.sqlite.SQLiteDatabase
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.round

data class WidgetSessionItem(
    val sessionId: String,
    val subjectId: String,
    val subjectName: String,
    val subjectCode: String,
    val subjectColor: String,
    val startTime: String,
    val endTime: String,
    val status: String?, // "present", "absent", "cancelled", null
    val percentage: Double,
    val statusColor: String,
    val statusLabel: String
)

data class WidgetSubjectItem(
    val subjectId: String,
    val subjectName: String,
    val subjectCode: String,
    val subjectColor: String,
    val attended: Int,
    val absent: Int,
    val totalHeld: Int,
    val percentage: Double,
    val effectiveTarget: Double,
    val tier: String, // "safe", "warning", "danger", "neutral"
    val statusLabel: String
)

data class WidgetSnapshot(
    val isPro: Boolean,
    val date: String,
    val formattedDate: String,
    val unmarkedCount: Int,
    val totalSessions: Int,
    val isHoliday: Boolean,
    val holidayLabel: String?,
    val overallPercentage: Double,
    val overallStatus: String, // "safe", "close", "below"
    val targetPercentage: Double,
    val sessions: List<WidgetSessionItem>,
    val subjects: List<WidgetSubjectItem> = emptyList()
)

object WidgetStorage {
    const val AUTO_SUBJECT_ID = "auto"

    private const val PREFS_NAME = "bound_widget_prefs"
    private const val KEY_SNAPSHOT = "snapshot_json"
    private const val KEY_IS_PRO = "is_pro"
    private const val KEY_PINNED_PREFIX = "pinned_subject_"
    private const val KEY_PENDING_PIN = "pending_pin_subject"
    private const val DB_NAME = "bound.db"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun isPro(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_IS_PRO, true)
    }

    fun setPro(context: Context, isPro: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_IS_PRO, isPro).apply()
    }

    fun setPinnedSubject(context: Context, appWidgetId: Int, subjectIdOrAuto: String) {
        getPrefs(context).edit().putString("$KEY_PINNED_PREFIX$appWidgetId", subjectIdOrAuto).apply()
    }

    fun getPinnedSubject(context: Context, appWidgetId: Int): String {
        return getPrefs(context).getString("$KEY_PINNED_PREFIX$appWidgetId", AUTO_SUBJECT_ID) ?: AUTO_SUBJECT_ID
    }

    fun clearPinnedSubject(context: Context, appWidgetId: Int) {
        getPrefs(context).edit().remove("$KEY_PINNED_PREFIX$appWidgetId").apply()
    }

    fun setPendingPinSubject(context: Context, subjectIdOrAuto: String) {
        getPrefs(context).edit().putString(KEY_PENDING_PIN, subjectIdOrAuto).apply()
    }

    fun consumePendingPinSubject(context: Context): String? {
        val prefs = getPrefs(context)
        val pending = prefs.getString(KEY_PENDING_PIN, null)
        if (pending != null) {
            prefs.edit().remove(KEY_PENDING_PIN).apply()
        }
        return pending
    }

    /**
     * Resolves which subject a specific Subject Progress widget instance should display,
     * along with whether it is in Auto (lowest-attendance) mode.
     */
    fun resolveSubjectForWidget(
        context: Context,
        appWidgetId: Int,
        snapshot: WidgetSnapshot?
    ): Pair<WidgetSubjectItem?, Boolean> {
        if (snapshot == null || snapshot.subjects.isEmpty()) {
            val isAuto = getPinnedSubject(context, appWidgetId) == AUTO_SUBJECT_ID
            return Pair(null, isAuto)
        }

        val pinnedKey = getPinnedSubject(context, appWidgetId)
        if (pinnedKey == AUTO_SUBJECT_ID) {
            val lowestHeld = snapshot.subjects
                .filter { it.totalHeld > 0 }
                .minByOrNull { it.percentage }
            return Pair(lowestHeld ?: snapshot.subjects.firstOrNull(), true)
        }

        val exact = snapshot.subjects.find { it.subjectId == pinnedKey }
        if (exact != null) {
            return Pair(exact, false)
        }

        // Fallback if the pinned subject was archived or deleted
        val fallback = snapshot.subjects
            .filter { it.totalHeld > 0 }
            .minByOrNull { it.percentage } ?: snapshot.subjects.firstOrNull()
        return Pair(fallback, false)
    }

    fun saveSnapshotJson(context: Context, jsonStr: String) {
        getPrefs(context).edit().putString(KEY_SNAPSHOT, jsonStr).apply()
    }

    fun getSnapshot(context: Context): WidgetSnapshot? {
        val jsonStr = getPrefs(context).getString(KEY_SNAPSHOT, null) ?: return null
        return try {
            val root = JSONObject(jsonStr)
            val isPro = getPrefs(context).getBoolean(KEY_IS_PRO, root.optBoolean("isPro", true))
            val date = root.optString("date", "")
            val formattedDate = root.optString("formattedDate", "Today")
            val unmarkedCount = root.optInt("unmarkedCount", 0)
            val totalSessions = root.optInt("totalSessions", 0)
            val isHoliday = root.optBoolean("isHoliday", false)
            val holidayLabel = if (root.has("holidayLabel") && !root.isNull("holidayLabel")) {
                root.optString("holidayLabel")
            } else {
                null
            }
            val overallPercentage = root.optDouble("overallPercentage", 0.0)
            val overallStatus = root.optString("overallStatus", "safe")
            val targetPercentage = root.optDouble("targetPercentage", 75.0)

            val sessionsArray = root.optJSONArray("sessions") ?: JSONArray()
            val sessionList = mutableListOf<WidgetSessionItem>()
            for (i in 0 until sessionsArray.length()) {
                val s = sessionsArray.getJSONObject(i)
                sessionList.add(
                    WidgetSessionItem(
                        sessionId = s.getString("sessionId"),
                        subjectId = s.getString("subjectId"),
                        subjectName = s.getString("subjectName"),
                        subjectCode = s.optString("subjectCode", s.getString("subjectName")),
                        subjectColor = s.optString("subjectColor", "#3DDC84"),
                        startTime = s.optString("startTime", "09:00"),
                        endTime = s.optString("endTime", "10:00"),
                        status = if (s.isNull("status")) null else s.getString("status"),
                        percentage = s.optDouble("percentage", 0.0),
                        statusColor = s.optString("statusColor", "#3DDC84"),
                        statusLabel = s.optString("statusLabel", "Can miss 0")
                    )
                )
            }

            val subjectsArray = root.optJSONArray("subjects") ?: JSONArray()
            val subjectList = mutableListOf<WidgetSubjectItem>()
            for (i in 0 until subjectsArray.length()) {
                val sub = subjectsArray.getJSONObject(i)
                subjectList.add(
                    WidgetSubjectItem(
                        subjectId = sub.getString("subjectId"),
                        subjectName = sub.getString("subjectName"),
                        subjectCode = sub.optString("subjectCode", sub.getString("subjectName")),
                        subjectColor = sub.optString("subjectColor", "#3DDC84"),
                        attended = sub.optInt("attended", 0),
                        absent = sub.optInt("absent", 0),
                        totalHeld = sub.optInt("totalHeld", 0),
                        percentage = sub.optDouble("percentage", 0.0),
                        effectiveTarget = sub.optDouble("effectiveTarget", targetPercentage),
                        tier = sub.optString("tier", "neutral"),
                        statusLabel = sub.optString("statusLabel", "No classes yet")
                    )
                )
            }

            WidgetSnapshot(
                isPro = isPro,
                date = date,
                formattedDate = formattedDate,
                unmarkedCount = unmarkedCount,
                totalSessions = totalSessions,
                isHoliday = isHoliday,
                holidayLabel = holidayLabel,
                overallPercentage = overallPercentage,
                overallStatus = overallStatus,
                targetPercentage = targetPercentage,
                sessions = sessionList,
                subjects = subjectList
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun serializeSnapshot(snapshot: WidgetSnapshot): String {
        val rootJson = JSONObject().apply {
            put("isPro", snapshot.isPro)
            put("date", snapshot.date)
            put("formattedDate", snapshot.formattedDate)
            put("unmarkedCount", snapshot.unmarkedCount)
            put("totalSessions", snapshot.totalSessions)
            put("isHoliday", snapshot.isHoliday)
            put("holidayLabel", snapshot.holidayLabel)
            put("overallPercentage", snapshot.overallPercentage)
            put("overallStatus", snapshot.overallStatus)
            put("targetPercentage", snapshot.targetPercentage)

            val sessionsArr = JSONArray()
            for (s in snapshot.sessions) {
                sessionsArr.put(JSONObject().apply {
                    put("sessionId", s.sessionId)
                    put("subjectId", s.subjectId)
                    put("subjectName", s.subjectName)
                    put("subjectCode", s.subjectCode)
                    put("subjectColor", s.subjectColor)
                    put("startTime", s.startTime)
                    put("endTime", s.endTime)
                    put("status", s.status)
                    put("percentage", s.percentage)
                    put("statusColor", s.statusColor)
                    put("statusLabel", s.statusLabel)
                })
            }
            put("sessions", sessionsArr)

            val subjectsArr = JSONArray()
            for (sub in snapshot.subjects) {
                subjectsArr.put(JSONObject().apply {
                    put("subjectId", sub.subjectId)
                    put("subjectName", sub.subjectName)
                    put("subjectCode", sub.subjectCode)
                    put("subjectColor", sub.subjectColor)
                    put("attended", sub.attended)
                    put("absent", sub.absent)
                    put("totalHeld", sub.totalHeld)
                    put("percentage", sub.percentage)
                    put("effectiveTarget", sub.effectiveTarget)
                    put("tier", sub.tier)
                    put("statusLabel", sub.statusLabel)
                })
            }
            put("subjects", subjectsArr)
        }
        return rootJson.toString()
    }

    private fun recomputeSubjectItem(
        item: WidgetSubjectItem,
        attendedDelta: Int,
        absentDelta: Int
    ): WidgetSubjectItem {
        val attended = max(0, item.attended + attendedDelta)
        val absent = max(0, item.absent + absentDelta)
        val totalHeld = attended + absent

        if (totalHeld == 0) {
            return item.copy(
                attended = 0,
                absent = 0,
                totalHeld = 0,
                percentage = 0.0,
                tier = "neutral",
                statusLabel = "No classes yet"
            )
        }

        val rawPct = (attended.toDouble() / totalHeld.toDouble()) * 100.0
        val roundedPct = round(rawPct * 10.0) / 10.0
        val target = item.effectiveTarget
        val targetFraction = target / 100.0

        val statusLabel = if (roundedPct >= target) {
            if (totalHeld == 1 && attended == 1) {
                "100% Streak"
            } else if (targetFraction <= 0.0) {
                "Can miss 999"
            } else {
                val canMiss = max(0, floor(attended / targetFraction).toInt() - totalHeld)
                if (canMiss > 0) "Can miss $canMiss" else "Can miss 0"
            }
        } else {
            if (targetFraction >= 1.0) {
                "Cannot reach 100%"
            } else {
                val needed = max(1, ceil((targetFraction * totalHeld - attended) / (1.0 - targetFraction)).toInt())
                "Attend next $needed"
            }
        }

        val tier = when {
            roundedPct < target -> "danger"
            roundedPct < target + 5.0 -> "warning"
            else -> "safe"
        }

        return item.copy(
            attended = attended,
            absent = absent,
            totalHeld = totalHeld,
            percentage = roundedPct,
            tier = tier,
            statusLabel = statusLabel
        )
    }

    private fun tierToStatusColor(tier: String): String {
        return when (tier) {
            "danger" -> "#FF6B72"
            "warning" -> "#FFB020"
            else -> "#3DDC84"
        }
    }

    private fun applySubjectDeltas(
        snapshot: WidgetSnapshot,
        deltasBySubject: Map<String, Pair<Int, Int>>,
        updatedSessions: List<WidgetSessionItem>
    ): WidgetSnapshot {
        val updatedSubjects = snapshot.subjects.map { sub ->
            val delta = deltasBySubject[sub.subjectId]
            if (delta != null && !snapshot.isHoliday) {
                recomputeSubjectItem(sub, delta.first, delta.second)
            } else {
                sub
            }
        }
        val subjectById = updatedSubjects.associateBy { it.subjectId }
        val syncedSessions = updatedSessions.map { ses ->
            val sub = subjectById[ses.subjectId]
            if (sub != null) {
                ses.copy(
                    percentage = sub.percentage,
                    statusColor = tierToStatusColor(sub.tier),
                    statusLabel = sub.statusLabel
                )
            } else {
                ses
            }
        }
        return snapshot.copy(
            unmarkedCount = syncedSessions.count { it.status == null },
            sessions = syncedSessions,
            subjects = updatedSubjects
        )
    }

    fun updateSessionStatus(context: Context, sessionId: String, targetStatus: String): String? {
        val snapshot = getSnapshot(context) ?: return null
        val session = snapshot.sessions.find { it.sessionId == sessionId } ?: return null

        // Toggle logic: if already targetStatus, set to null (unmarked)
        val oldStatus = session.status
        val finalStatus: String? = if (oldStatus == targetStatus) null else targetStatus
        val nowIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())

        // 1. Update SQLite bound.db directly for immediate persistence
        try {
            val dbFile = context.getDatabasePath(DB_NAME)
            if (dbFile.exists()) {
                val db = SQLiteDatabase.openDatabase(dbFile.absolutePath, null, SQLiteDatabase.OPEN_READWRITE)
                val markedAtVal = if (finalStatus != null) nowIso else null
                db.execSQL(
                    "UPDATE sessions SET status = ?, marked_at = ? WHERE id = ?",
                    arrayOf(finalStatus, markedAtVal, sessionId)
                )
                db.close()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 2. Compute attendance deltas for subject stats parity
        var attendedDelta = 0
        var absentDelta = 0
        if (oldStatus == "present") attendedDelta-- else if (oldStatus == "absent") absentDelta--
        if (finalStatus == "present") attendedDelta++ else if (finalStatus == "absent") absentDelta++

        val updatedSessions = snapshot.sessions.map {
            if (it.sessionId == sessionId) it.copy(status = finalStatus) else it
        }
        val nextSnapshot = applySubjectDeltas(
            snapshot,
            mapOf(session.subjectId to Pair(attendedDelta, absentDelta)),
            updatedSessions
        )

        saveSnapshotJson(context, serializeSnapshot(nextSnapshot))
        return finalStatus
    }

    fun batchMarkAllPresent(context: Context): Int {
        val snapshot = getSnapshot(context) ?: return 0
        val nowIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())

        val unmarkedSessions = snapshot.sessions.filter { it.status == null }
        if (unmarkedSessions.isEmpty()) return 0

        // 1. Update SQLite bound.db
        try {
            val dbFile = context.getDatabasePath(DB_NAME)
            if (dbFile.exists()) {
                val db = SQLiteDatabase.openDatabase(dbFile.absolutePath, null, SQLiteDatabase.OPEN_READWRITE)
                db.beginTransaction()
                try {
                    for (ses in unmarkedSessions) {
                        db.execSQL(
                            "UPDATE sessions SET status = 'present', marked_at = ? WHERE id = ? AND status IS NULL",
                            arrayOf(nowIso, ses.sessionId)
                        )
                    }
                    db.setTransactionSuccessful()
                } finally {
                    db.endTransaction()
                    db.close()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 2. Compute per-subject present deltas
        val deltas = mutableMapOf<String, Pair<Int, Int>>()
        for (ses in unmarkedSessions) {
            val prev = deltas[ses.subjectId] ?: Pair(0, 0)
            deltas[ses.subjectId] = Pair(prev.first + 1, prev.second)
        }

        val updatedSessions = snapshot.sessions.map {
            if (it.status == null) it.copy(status = "present") else it
        }
        val nextSnapshot = applySubjectDeltas(snapshot, deltas, updatedSessions)

        saveSnapshotJson(context, serializeSnapshot(nextSnapshot))
        return unmarkedSessions.size
    }
}
