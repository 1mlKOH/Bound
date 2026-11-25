package com.bound.attendance.widget

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.text.TextUtils
import android.view.Gravity
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

class BoundSubjectConfigActivity : Activity() {

    private var appWidgetId: Int = AppWidgetManager.INVALID_APPWIDGET_ID

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Default to CANCELED if user navigates back before selecting
        setResult(RESULT_CANCELED)

        appWidgetId = intent?.extras?.getInt(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
        ) ?: AppWidgetManager.INVALID_APPWIDGET_ID

        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }

        val isDark = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) ==
            Configuration.UI_MODE_NIGHT_YES

        val bgCanvas = if (isDark) Color.parseColor("#0F1014") else Color.parseColor("#F3F3F5")
        val cardBg = if (isDark) Color.parseColor("#1B1C21") else Color.parseColor("#FBFBFD")
        val borderCol = if (isDark) Color.parseColor("#2C2D34") else Color.parseColor("#E3E3E8")
        val textPrimary = if (isDark) Color.parseColor("#F5F5F7") else Color.parseColor("#111114")
        val textMuted = if (isDark) Color.parseColor("#A4A4B0") else Color.parseColor("#6E6E78")
        val amberColor = if (isDark) Color.parseColor("#FFB020") else Color.parseColor("#B26A00")

        val density = resources.displayMetrics.density
        fun dp(v: Int): Int = (v * density).roundToInt()

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(bgCanvas)
            setPadding(dp(20), dp(44), dp(20), dp(24))
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        // Title & Subtitle
        val titleView = TextView(this).apply {
            text = "Pin Subject Widget"
            textSize = 24f
            setTextColor(textPrimary)
            typeface = Typeface.DEFAULT_BOLD
        }
        val subtitleView = TextView(this).apply {
            text = "Choose a subject to track, or auto-pin your lowest attendance course."
            textSize = 14f
            setTextColor(textMuted)
            setPadding(0, dp(4), 0, dp(18))
        }
        root.addView(titleView)
        root.addView(subtitleView)

        val scroll = ScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f
            )
        }
        val listContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
        }

        val snapshot = WidgetStorage.getSnapshot(this)
        val currentSelection = WidgetStorage.getPinnedSubject(this, appWidgetId)

        // 1. Auto: Lowest Subject Option
        val lowestSub = snapshot?.subjects?.filter { it.totalHeld > 0 }?.minByOrNull { it.percentage }
            ?: snapshot?.subjects?.firstOrNull()
        val autoSubtitle = if (lowestSub != null) {
            val pctStr = if (lowestSub.totalHeld == 0) "—%" else "${lowestSub.percentage.roundToInt()}%"
            "Tracking ${lowestSub.subjectCode} ($pctStr) right now"
        } else {
            "Automatically tracks whichever course needs attention most"
        }

        val isAutoSelected = currentSelection == WidgetStorage.AUTO_SUBJECT_ID
        val autoCard = buildSelectionRow(
            badgeText = "⚡",
            badgeBgColor = Color.argb(40, 255, 176, 32),
            badgeTextColor = amberColor,
            title = "Auto: Lowest Subject",
            subtitle = autoSubtitle,
            trailingText = "AUTO",
            trailingColor = amberColor,
            isSelected = isAutoSelected,
            cardBg = cardBg,
            borderCol = if (isAutoSelected) amberColor else borderCol,
            textPrimary = textPrimary,
            textMuted = textMuted,
            dp = ::dp
        )
        autoCard.setOnClickListener {
            confirmSelection(WidgetStorage.AUTO_SUBJECT_ID)
        }
        listContainer.addView(autoCard)

        // 2. Fixed Subject Rows
        val subjects = snapshot?.subjects ?: emptyList()
        if (subjects.isEmpty()) {
            val emptyNote = TextView(this).apply {
                text = "Open Bound once to load your courses, or tap Auto above to get started."
                textSize = 13f
                setTextColor(textMuted)
                setPadding(dp(4), dp(14), dp(4), dp(8))
            }
            listContainer.addView(emptyNote)
        } else {
            for (sub in subjects) {
                val subColor = try {
                    Color.parseColor(sub.subjectColor)
                } catch (_: Exception) {
                    Color.parseColor("#3DDC84")
                }
                val tierColor = when (sub.tier) {
                    "danger" -> if (isDark) Color.parseColor("#FF6B72") else Color.parseColor("#D1323A")
                    "warning" -> amberColor
                    "safe" -> if (isDark) Color.parseColor("#3DDC84") else Color.parseColor("#0D8A33")
                    else -> textMuted
                }
                val pctStr = if (sub.totalHeld == 0) "—%" else "${sub.percentage.roundToInt()}%"
                val isSelected = currentSelection == sub.subjectId

                val row = buildSelectionRow(
                    badgeText = sub.subjectCode.take(2).uppercase(),
                    badgeBgColor = subColor,
                    badgeTextColor = Color.WHITE,
                    title = sub.subjectName,
                    subtitle = "${sub.subjectCode} · ${sub.statusLabel}",
                    trailingText = pctStr,
                    trailingColor = tierColor,
                    isSelected = isSelected,
                    cardBg = cardBg,
                    borderCol = if (isSelected) subColor else borderCol,
                    textPrimary = textPrimary,
                    textMuted = textMuted,
                    dp = ::dp
                )
                row.setOnClickListener {
                    confirmSelection(sub.subjectId)
                }
                listContainer.addView(row)
            }
        }

        scroll.addView(listContainer)
        root.addView(scroll)
        setContentView(root)
    }

    private fun buildSelectionRow(
        badgeText: String,
        badgeBgColor: Int,
        badgeTextColor: Int,
        title: String,
        subtitle: String,
        trailingText: String,
        trailingColor: Int,
        isSelected: Boolean,
        cardBg: Int,
        borderCol: Int,
        textPrimary: Int,
        textMuted: Int,
        dp: (Int) -> Int
    ): LinearLayout {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(14), dp(14), dp(14))
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dp(20).toFloat()
                setColor(cardBg)
                setStroke(dp(if (isSelected) 2 else 1), borderCol)
            }
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dp(10)
            }
        }

        val iconTile = TextView(this).apply {
            text = badgeText
            textSize = 13f
            setTextColor(badgeTextColor)
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dp(12).toFloat()
                setColor(badgeBgColor)
            }
            layoutParams = LinearLayout.LayoutParams(dp(40), dp(40)).apply {
                marginEnd = dp(12)
            }
        }

        val textCol = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                marginEnd = dp(10)
            }
        }

        val titleTv = TextView(this).apply {
            text = title
            textSize = 15f
            setTextColor(textPrimary)
            typeface = Typeface.DEFAULT_BOLD
            maxLines = 1
            ellipsize = TextUtils.TruncateAt.END
        }
        val subTv = TextView(this).apply {
            text = subtitle
            textSize = 12f
            setTextColor(textMuted)
            maxLines = 1
            ellipsize = TextUtils.TruncateAt.END
        }
        textCol.addView(titleTv)
        textCol.addView(subTv)

        val trailingTv = TextView(this).apply {
            text = trailingText
            textSize = 14f
            setTextColor(trailingColor)
            typeface = Typeface.DEFAULT_BOLD
        }

        card.addView(iconTile)
        card.addView(textCol)
        card.addView(trailingTv)
        return card
    }

    private fun confirmSelection(subjectIdOrAuto: String) {
        WidgetStorage.setPinnedSubject(this, appWidgetId, subjectIdOrAuto)

        val resultIntent = Intent().apply {
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        setResult(RESULT_OK, resultIntent)

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val manager = GlanceAppWidgetManager(this@BoundSubjectConfigActivity)
                val glanceId = manager.getGlanceIdBy(appWidgetId)
                BoundSubjectWidget().update(this@BoundSubjectConfigActivity, glanceId)
            } catch (_: Exception) {
                try {
                    BoundSubjectWidget().updateAll(this@BoundSubjectConfigActivity)
                } catch (_: Exception) {}
            } finally {
                finish()
            }
        }
    }
}
