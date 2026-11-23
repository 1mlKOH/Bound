package com.bound.attendance.widget

import android.content.Context
import android.content.SharedPreferences
import android.database.sqlite.SQLiteDatabase
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

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
    val sessions: List<WidgetSessionItem>
)

object WidgetStorage {
    private const val PREFS_NAME = "bound_widget_prefs"
    private const val KEY_SNAPSHOT = "snapshot_json"
    private const val KEY_IS_PRO = "is_pro"
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
            val holidayLabel = if (root.has("holidayLabel")) root.optString("holidayLabel") else null
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
                sessions = sessionList
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    fun updateSessionStatus(context: Context, sessionId: String, targetStatus: String): String? {
        val snapshot = getSnapshot(context) ?: return null
        val session = snapshot.sessions.find { it.sessionId == sessionId } ?: return null

        // Toggle logic: if already targetStatus, set to null (unmarked)
        val finalStatus: String? = if (session.status == targetStatus) null else targetStatus
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

        // 2. Update snapshot JSON in memory & SharedPreferences
        val updatedSessions = snapshot.sessions.map {
            if (it.sessionId == sessionId) it.copy(status = finalStatus) else it
        }
        val newUnmarked = updatedSessions.count { it.status == null }

        val rootJson = JSONObject().apply {
            put("isPro", snapshot.isPro)
            put("date", snapshot.date)
            put("formattedDate", snapshot.formattedDate)
            put("unmarkedCount", newUnmarked)
            put("totalSessions", snapshot.totalSessions)
            put("isHoliday", snapshot.isHoliday)
            put("holidayLabel", snapshot.holidayLabel)
            put("overallPercentage", snapshot.overallPercentage)
            put("overallStatus", snapshot.overallStatus)
            put("targetPercentage", snapshot.targetPercentage)

            val arr = JSONArray()
            for (s in updatedSessions) {
                arr.put(JSONObject().apply {
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
            put("sessions", arr)
        }

        saveSnapshotJson(context, rootJson.toString())
        return finalStatus
    }

    fun batchMarkAllPresent(context: Context): Int {
        val snapshot = getSnapshot(context) ?: return 0
        val nowIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())

        val unmarkedIds = snapshot.sessions.filter { it.status == null }.map { it.sessionId }
        if (unmarkedIds.isEmpty()) return 0

        // 1. Update SQLite bound.db
        try {
            val dbFile = context.getDatabasePath(DB_NAME)
            if (dbFile.exists()) {
                val db = SQLiteDatabase.openDatabase(dbFile.absolutePath, null, SQLiteDatabase.OPEN_READWRITE)
                db.beginTransaction()
                try {
                    for (id in unmarkedIds) {
                        db.execSQL(
                            "UPDATE sessions SET status = 'present', marked_at = ? WHERE id = ? AND status IS NULL",
                            arrayOf(nowIso, id)
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

        // 2. Update snapshot JSON
        val updatedSessions = snapshot.sessions.map {
            if (it.status == null) it.copy(status = "present") else it
        }

        val rootJson = JSONObject().apply {
            put("isPro", snapshot.isPro)
            put("date", snapshot.date)
            put("formattedDate", snapshot.formattedDate)
            put("unmarkedCount", 0)
            put("totalSessions", snapshot.totalSessions)
            put("isHoliday", snapshot.isHoliday)
            put("holidayLabel", snapshot.holidayLabel)
            put("overallPercentage", snapshot.overallPercentage)
            put("overallStatus", snapshot.overallStatus)
            put("targetPercentage", snapshot.targetPercentage)

            val arr = JSONArray()
            for (s in updatedSessions) {
                arr.put(JSONObject().apply {
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
            put("sessions", arr)
        }

        saveSnapshotJson(context, rootJson.toString())
        return unmarkedIds.size
    }
}
