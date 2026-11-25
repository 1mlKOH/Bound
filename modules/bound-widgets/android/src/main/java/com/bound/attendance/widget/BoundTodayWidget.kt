package com.bound.attendance.widget

import android.content.Context
import android.content.Intent
import android.graphics.Color as AndroidColor
import android.net.Uri
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.action.actionParametersOf
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.lazy.LazyColumn
import androidx.glance.appwidget.lazy.items
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

class BoundTodayWidget : GlanceAppWidget() {

    override val sizeMode: SizeMode = SizeMode.Exact

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val snapshot = WidgetStorage.getSnapshot(context)
            val isPro = WidgetStorage.isPro(context)

            // Theme colors (Defaulting to Dark Theme matching Bound's Obsidian palette)
            val widgetBg = Color(0xFF0F, 0x10, 0x14)
            val widgetBorder = Color(0xFF2C, 0x2D, 0x34)
            val cardBg = Color(0xFF1B, 0x1C, 0x21)
            val textPrimary = Color(0xFFF5, 0xF5, 0xF7)
            val textSecondary = Color(0xFFB5, 0xB5, 0xC0)
            val textMuted = Color(0xFF8E, 0x8E, 0x9A)
            val emerald = Color(0xFF3D, 0xDC, 0x84)
            val amber = Color(0xFFFF, 0xB0, 0x20)
            val rose = Color(0xFFFF, 0x6B, 0x72)

            val openTodayIntent = boundDeepLinkIntent(context, "bound://today")

            Box(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .cornerRadius(28.dp)
                    .background(widgetBg)
                    .padding(top = 12.dp, start = 12.dp, end = 12.dp, bottom = 10.dp)
            ) {
                Column(modifier = GlanceModifier.fillMaxSize()) {
                    // 1. Header (W_BRAND + W_BATCH_ALL)
                    Row(
                        modifier = GlanceModifier
                            .fillMaxWidth()
                            .height(32.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Brand Lockup (W_BRAND)
                        Row(
                            modifier = GlanceModifier
                                .clickable(actionStartActivity(openTodayIntent)),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Image(
                                provider = ImageProvider(R.drawable.ic_widget_logo),
                                contentDescription = "Bound Logo",
                                modifier = GlanceModifier.size(22.dp)
                            )
                            Spacer(modifier = GlanceModifier.width(6.dp))
                            Text(
                                text = "Bound",
                                style = TextStyle(
                                    color = ColorProvider(textPrimary),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            Spacer(modifier = GlanceModifier.width(6.dp))
                            val contextText = if (snapshot != null) {
                                "${snapshot.formattedDate} · ${snapshot.unmarkedCount} left"
                            } else {
                                "Today"
                            }
                            Text(
                                text = contextText,
                                style = TextStyle(
                                    color = ColorProvider(textSecondary),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                        }

                        Spacer(modifier = GlanceModifier.defaultWeight())

                        // Batch Mark All Present Button (W_BATCH_ALL)
                        if (isPro && snapshot != null && !snapshot.isHoliday && snapshot.sessions.isNotEmpty()) {
                            if (snapshot.unmarkedCount > 0) {
                                Row(
                                    modifier = GlanceModifier
                                        .height(30.dp)
                                        .cornerRadius(999.dp)
                                        .background(Color(0xFF25, 0x26, 0x2E))
                                        .padding(horizontal = 10.dp)
                                        .clickable(actionRunCallback<BatchMarkAction>()),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Image(
                                        provider = ImageProvider(R.drawable.ic_widget_check_all),
                                        contentDescription = "All Present",
                                        modifier = GlanceModifier.size(13.dp)
                                    )
                                    Spacer(modifier = GlanceModifier.width(5.dp))
                                    Text(
                                        text = "All Present",
                                        style = TextStyle(
                                            color = ColorProvider(Color(0xFFC8, 0xC8, 0xD2)),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }
                            } else {
                                // All Marked
                                Row(
                                    modifier = GlanceModifier
                                        .height(30.dp)
                                        .cornerRadius(999.dp)
                                        .background(Color(0x28, 0x3D, 0xDC, 0x84))
                                        .padding(horizontal = 10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Image(
                                        provider = ImageProvider(R.drawable.ic_widget_check),
                                        contentDescription = "All Marked",
                                        modifier = GlanceModifier.size(12.dp)
                                    )
                                    Spacer(modifier = GlanceModifier.width(5.dp))
                                    Text(
                                        text = "All Marked",
                                        style = TextStyle(
                                            color = ColorProvider(emerald),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }
                            }
                        } else if (!isPro) {
                            // Pro badge on top right
                            Row(
                                modifier = GlanceModifier
                                    .height(28.dp)
                                    .cornerRadius(999.dp)
                                    .background(Color(0x28, 0xFF, 0xB0, 0x20))
                                    .padding(horizontal = 8.dp)
                                    .clickable(actionStartActivity(boundDeepLinkIntent(context, "bound://paywall?source=widget_badge"))),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Image(
                                    provider = ImageProvider(R.drawable.ic_widget_star),
                                    contentDescription = "Pro",
                                    modifier = GlanceModifier.size(12.dp)
                                )
                                Spacer(modifier = GlanceModifier.width(4.dp))
                                Text(
                                    text = "Pro",
                                    style = TextStyle(
                                        color = ColorProvider(amber),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            }
                        }
                    }

                    Spacer(modifier = GlanceModifier.height(8.dp))

                    // 2. Body Content
                    if (!isPro) {
                        // PAYWALL / LOCKED STATE (W_PAYWALL)
                        val paywallIntent = boundDeepLinkIntent(context, "bound://paywall?source=widget_locked")
                        Box(
                            modifier = GlanceModifier
                                .fillMaxWidth()
                                .defaultWeight()
                                .cornerRadius(16.dp)
                                .background(cardBg)
                                .padding(12.dp)
                                .clickable(actionStartActivity(paywallIntent)),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Image(
                                        provider = ImageProvider(R.drawable.ic_widget_lock),
                                        contentDescription = "Locked",
                                        modifier = GlanceModifier.size(18.dp)
                                    )
                                    Spacer(modifier = GlanceModifier.width(8.dp))
                                    Text(
                                        text = "Interactive Timetable & 1-Tap Attendance",
                                        style = TextStyle(
                                            color = ColorProvider(textPrimary),
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }
                                Spacer(modifier = GlanceModifier.height(4.dp))
                                Text(
                                    text = "Track live skip buffers & mark classes directly from your home screen.",
                                    style = TextStyle(
                                        color = ColorProvider(textMuted),
                                        fontSize = 11.sp
                                    )
                                )
                                Spacer(modifier = GlanceModifier.height(8.dp))
                                Row(
                                    modifier = GlanceModifier
                                        .cornerRadius(999.dp)
                                        .background(Color(0xFF25, 0x26, 0x2E))
                                        .padding(horizontal = 12.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Image(
                                        provider = ImageProvider(R.drawable.ic_widget_star),
                                        contentDescription = "Star",
                                        modifier = GlanceModifier.size(13.dp)
                                    )
                                    Spacer(modifier = GlanceModifier.width(6.dp))
                                    Text(
                                        text = "Unlock Bound Pro — Tap to Upgrade",
                                        style = TextStyle(
                                            color = ColorProvider(amber),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }
                            }
                        }
                    } else if (snapshot == null) {
                        // Empty / loading placeholder
                        Box(
                            modifier = GlanceModifier
                                .fillMaxWidth()
                                .defaultWeight()
                                .cornerRadius(16.dp)
                                .background(cardBg)
                                .padding(12.dp)
                                .clickable(actionStartActivity(openTodayIntent)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Open Bound to sync your timetable",
                                style = TextStyle(
                                    color = ColorProvider(textSecondary),
                                    fontSize = 12.sp
                                )
                            )
                        }
                    } else if (snapshot.isHoliday) {
                        // HOLIDAY STATE
                        Box(
                            modifier = GlanceModifier
                                .fillMaxWidth()
                                .defaultWeight()
                                .cornerRadius(16.dp)
                                .background(Color(0x24, 0xF5, 0x9E, 0x0B))
                                .padding(12.dp)
                                .clickable(actionStartActivity(openTodayIntent)),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "Holiday Today · Attendance Paused",
                                    style = TextStyle(
                                        color = ColorProvider(amber),
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                if (!snapshot.holidayLabel.isNullOrBlank()) {
                                    Spacer(modifier = GlanceModifier.height(4.dp))
                                    Text(
                                        text = snapshot.holidayLabel,
                                        style = TextStyle(
                                            color = ColorProvider(textSecondary),
                                            fontSize = 11.sp
                                        )
                                    )
                                }
                            }
                        }
                    } else if (snapshot.sessions.isEmpty()) {
                        // NO CLASSES SCHEDULED TODAY
                        Box(
                            modifier = GlanceModifier
                                .fillMaxWidth()
                                .defaultWeight()
                                .cornerRadius(16.dp)
                                .background(cardBg)
                                .padding(12.dp)
                                .clickable(actionStartActivity(openTodayIntent)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No classes scheduled today · Tap to view timetable",
                                style = TextStyle(
                                    color = ColorProvider(textSecondary),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                        }
                    } else {
                        // ACTIVE DAY — SCROLLABLE TIMETABLE (W_LIST)
                        LazyColumn(
                            modifier = GlanceModifier
                                .fillMaxWidth()
                                .defaultWeight()
                        ) {
                            items(snapshot.sessions) { session ->
                                val statsIntent = boundDeepLinkIntent(context, "bound://stats/${session.subjectId}")

                                val subjectColorParsed = try {
                                    Color(AndroidColor.parseColor(session.subjectColor))
                                } catch (e: Exception) {
                                    Color(0xFF3D, 0xDC, 0x84)
                                }

                                val statusColorParsed = try {
                                    Color(AndroidColor.parseColor(session.statusColor))
                                } catch (e: Exception) {
                                    Color(0xFF3D, 0xDC, 0x84)
                                }

                                val isPresent = session.status == "present"
                                val isAbsent = session.status == "absent"

                                // W_CARD
                                Row(
                                    modifier = GlanceModifier
                                        .fillMaxWidth()
                                        .height(52.dp)
                                        .cornerRadius(16.dp)
                                        .background(cardBg)
                                        .padding(horizontal = 8.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    // Left: Clickable Subject Analytics Deep Link (W_ICON + W_CODE)
                                    Row(
                                        modifier = GlanceModifier
                                            .defaultWeight()
                                            .clickable(actionStartActivity(statsIntent)),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        // W_ICON: Subject Initial Squircle (32x32dp, r=10dp)
                                        Box(
                                            modifier = GlanceModifier
                                                .size(32.dp)
                                                .cornerRadius(10.dp)
                                                .background(subjectColorParsed),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            val initial = session.subjectCode.take(2).uppercase()
                                            Text(
                                                text = initial,
                                                style = TextStyle(
                                                    color = ColorProvider(Color.White),
                                                    fontSize = 12.sp,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            )
                                        }

                                        Spacer(modifier = GlanceModifier.width(8.dp))

                                        // W_CODE: Subject Code + % and Time + Skip Buffer
                                        Column(
                                            modifier = GlanceModifier.defaultWeight()
                                        ) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text(
                                                    text = session.subjectCode,
                                                    style = TextStyle(
                                                        color = ColorProvider(textPrimary),
                                                        fontSize = 12.5.sp,
                                                        fontWeight = FontWeight.Bold
                                                    ),
                                                    maxLines = 1
                                                )
                                                Spacer(modifier = GlanceModifier.width(5.dp))
                                                Text(
                                                    text = "${session.percentage}%",
                                                    style = TextStyle(
                                                        color = ColorProvider(statusColorParsed),
                                                        fontSize = 11.sp,
                                                        fontWeight = FontWeight.Bold
                                                    )
                                                )
                                            }
                                            Spacer(modifier = GlanceModifier.height(1.dp))
                                            Text(
                                                text = "${session.startTime} · ${session.statusLabel}",
                                                style = TextStyle(
                                                    color = ColorProvider(textMuted),
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Medium
                                                ),
                                                maxLines = 1
                                            )
                                        }
                                    }

                                    Spacer(modifier = GlanceModifier.width(6.dp))

                                    // Right: Circular Action Buttons (W_BTN_PRESENT & W_BTN_ABSENT)
                                    // 1. Present Circular Button (34x34dp)
                                    Box(
                                        modifier = GlanceModifier
                                            .size(34.dp)
                                            .cornerRadius(999.dp)
                                            .background(
                                                if (isPresent) Color(0xFF00, 0xBF, 0x63)
                                                else Color(0xFF25, 0x26, 0x2E)
                                            )
                                            .clickable(
                                                actionRunCallback<MarkSessionAction>(
                                                    actionParametersOf(
                                                        SessionIdKey to session.sessionId,
                                                        TargetStatusKey to "present"
                                                    )
                                                )
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Image(
                                            provider = ImageProvider(R.drawable.ic_widget_check),
                                            contentDescription = "Mark Present",
                                            modifier = GlanceModifier.size(15.dp)
                                        )
                                    }

                                    Spacer(modifier = GlanceModifier.width(6.dp))

                                    // 2. Absent Circular Button (34x34dp)
                                    Box(
                                        modifier = GlanceModifier
                                            .size(34.dp)
                                            .cornerRadius(999.dp)
                                            .background(
                                                if (isAbsent) Color(0xFFD6, 0x33, 0x6C)
                                                else Color(0xFF25, 0x26, 0x2E)
                                            )
                                            .clickable(
                                                actionRunCallback<MarkSessionAction>(
                                                    actionParametersOf(
                                                        SessionIdKey to session.sessionId,
                                                        TargetStatusKey to "absent"
                                                    )
                                                )
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Image(
                                            provider = ImageProvider(R.drawable.ic_widget_close),
                                            contentDescription = "Mark Absent",
                                            modifier = GlanceModifier.size(14.dp)
                                        )
                                    }
                                }

                                Spacer(modifier = GlanceModifier.height(6.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
