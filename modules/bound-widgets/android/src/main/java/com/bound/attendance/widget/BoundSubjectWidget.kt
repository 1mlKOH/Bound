package com.bound.attendance.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.res.Configuration
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Color as AndroidColor
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.ContentScale
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
import kotlin.math.roundToInt

private data class SubjectTierPalette(
    val bg: Color,
    val trackInt: Int,
    val fillInt: Int,
    val notchInt: Int,
    val text: Color,
    val subtext: Color,
    val badgeBg: Color,
    val badgeText: Color,
    val tierLabel: String
)

class BoundSubjectWidget : GlanceAppWidget() {

    companion object {
        private val SLIM_STRIP = DpSize(220.dp, 56.dp)
        private val SMALL_SQUARE = DpSize(110.dp, 110.dp)
        private val WIDE_CAPSULE = DpSize(220.dp, 110.dp)
    }

    override val sizeMode: SizeMode = SizeMode.Responsive(
        setOf(SLIM_STRIP, SMALL_SQUARE, WIDE_CAPSULE)
    )

    override fun onCompositionError(
        context: Context,
        glanceId: GlanceId,
        appWidgetId: Int,
        throwable: Throwable
    ) {
        handleGlanceCompositionError(context, appWidgetId, "BoundSubjectWidget", throwable)
    }

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val appWidgetId = try {
            GlanceAppWidgetManager(context).getAppWidgetId(id)
        } catch (_: Exception) {
            AppWidgetManager.INVALID_APPWIDGET_ID
        }

        provideContent {
            val size = LocalSize.current
            val snapshot = WidgetStorage.getSnapshot(context)
            val isPro = WidgetStorage.isPro(context)
            val isDark = (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) ==
                Configuration.UI_MODE_NIGHT_YES

            if (!isPro) {
                LockedSubjectCard(context = context, isDark = isDark, isSlim = size.height < 100.dp)
            } else {
                val (subject, isAutoMode) = WidgetStorage.resolveSubjectForWidget(context, appWidgetId, snapshot)
                if (subject == null) {
                    EmptySubjectCard(context = context, isDark = isDark)
                } else {
                    val palette = resolveTierPalette(subject.tier, isDark)
                    val openStatsIntent = boundDeepLinkIntent(context, "bound://stats/${subject.subjectId}")

                    when {
                        size.height < 100.dp -> SlimStripCard(
                            subject = subject,
                            isAutoMode = isAutoMode,
                            isDark = isDark,
                            palette = palette,
                            onClick = actionStartActivity(openStatsIntent)
                        )
                        size.width < 200.dp -> RadialArcCard(
                            subject = subject,
                            isAutoMode = isAutoMode,
                            isDark = isDark,
                            palette = palette,
                            onClick = actionStartActivity(openStatsIntent)
                        )
                        else -> HeroCapsuleCard(
                            subject = subject,
                            isAutoMode = isAutoMode,
                            isDark = isDark,
                            palette = palette,
                            onClick = actionStartActivity(openStatsIntent)
                        )
                    }
                }
            }
        }
    }

    private fun resolveTierPalette(tier: String, isDark: Boolean): SubjectTierPalette {
        return if (isDark) {
            when (tier) {
                "safe" -> SubjectTierPalette(
                    bg = Color(0xFF0B2317),
                    trackInt = AndroidColor.parseColor("#143D27"),
                    fillInt = AndroidColor.parseColor("#3DDC84"),
                    notchInt = AndroidColor.WHITE,
                    text = Color(0xFFF5F5F7),
                    subtext = Color(0xCCA7F3D0),
                    badgeBg = Color(0x283DDC84),
                    badgeText = Color(0xFF3DDC84),
                    tierLabel = "Safe"
                )
                "warning" -> SubjectTierPalette(
                    bg = Color(0xFF221607),
                    trackInt = AndroidColor.parseColor("#3D270E"),
                    fillInt = AndroidColor.parseColor("#FFB020"),
                    notchInt = AndroidColor.WHITE,
                    text = Color(0xFFF5F5F7),
                    subtext = Color(0xCCFDE68A),
                    badgeBg = Color(0x2EFFB020),
                    badgeText = Color(0xFFFFB020),
                    tierLabel = "Near Target"
                )
                "danger" -> SubjectTierPalette(
                    bg = Color(0xFF240B12),
                    trackInt = AndroidColor.parseColor("#3D121B"),
                    fillInt = AndroidColor.parseColor("#FF6B72"),
                    notchInt = AndroidColor.WHITE,
                    text = Color(0xFFF5F5F7),
                    subtext = Color(0xCCFECDD3),
                    badgeBg = Color(0x2EFF6B72),
                    badgeText = Color(0xFFFF6B72),
                    tierLabel = "Below Target"
                )
                else -> SubjectTierPalette(
                    bg = Color(0xFF1B1C21),
                    trackInt = AndroidColor.argb(26, 255, 255, 255),
                    fillInt = AndroidColor.argb(64, 255, 255, 255),
                    notchInt = AndroidColor.parseColor("#A4A4B0"),
                    text = Color(0xFFF5F5F7),
                    subtext = Color(0xFFA4A4B0),
                    badgeBg = Color(0x14FFFFFF),
                    badgeText = Color(0xFFA4A4B0),
                    tierLabel = "No Data"
                )
            }
        } else {
            when (tier) {
                "safe" -> SubjectTierPalette(
                    bg = Color(0xFFEAF8F0),
                    trackInt = AndroidColor.parseColor("#C8EED9"),
                    fillInt = AndroidColor.parseColor("#0D8A33"),
                    notchInt = AndroidColor.parseColor("#111114"),
                    text = Color(0xFF111114),
                    subtext = Color(0xFF047857),
                    badgeBg = Color(0x1F0D8A33),
                    badgeText = Color(0xFF0D8A33),
                    tierLabel = "Safe"
                )
                "warning" -> SubjectTierPalette(
                    bg = Color(0xFFFEF9C3),
                    trackInt = AndroidColor.parseColor("#FDE68A"),
                    fillInt = AndroidColor.parseColor("#B26A00"),
                    notchInt = AndroidColor.parseColor("#111114"),
                    text = Color(0xFF111114),
                    subtext = Color(0xFF92400E),
                    badgeBg = Color(0x24B26A00),
                    badgeText = Color(0xFFB26A00),
                    tierLabel = "Near Target"
                )
                "danger" -> SubjectTierPalette(
                    bg = Color(0xFFFFE4E6),
                    trackInt = AndroidColor.parseColor("#FECDD3"),
                    fillInt = AndroidColor.parseColor("#D1323A"),
                    notchInt = AndroidColor.parseColor("#111114"),
                    text = Color(0xFF111114),
                    subtext = Color(0xFF9F1239),
                    badgeBg = Color(0x24D1323A),
                    badgeText = Color(0xFFD1323A),
                    tierLabel = "Below Target"
                )
                else -> SubjectTierPalette(
                    bg = Color(0xFFFBFBFD),
                    trackInt = AndroidColor.argb(20, 0, 0, 0),
                    fillInt = AndroidColor.argb(50, 0, 0, 0),
                    notchInt = AndroidColor.parseColor("#111114"),
                    text = Color(0xFF111114),
                    subtext = Color(0xFF6E6E78),
                    badgeBg = Color(0x0F000000),
                    badgeText = Color(0xFF6E6E78),
                    tierLabel = "No Data"
                )
            }
        }
    }

    private fun parseSubjectColor(hex: String): Color {
        return try {
            Color(AndroidColor.parseColor(hex))
        } catch (_: Exception) {
            Color(0xFF3DDC84)
        }
    }

    private fun formatDisplayPct(subject: WidgetSubjectItem): String {
        return if (subject.totalHeld == 0) "—%" else "${subject.percentage.roundToInt()}%"
    }

    private fun renderRadialArcBitmap(
        percentage: Double,
        isZeroState: Boolean,
        trackColor: Int,
        fillColor: Int,
        sizePx: Int = 252
    ): Bitmap {
        val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val stroke = sizePx * 0.088f
        val pad = stroke / 2f + 4f
        val rect = RectF(pad, pad, sizePx - pad, sizePx - pad)

        val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = trackColor
            style = Paint.Style.STROKE
            strokeWidth = stroke
        }
        canvas.drawOval(rect, trackPaint)

        val pct = if (isZeroState) 0f else percentage.toFloat().coerceIn(0f, 100f)
        if (pct > 0f) {
            val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = fillColor
                style = Paint.Style.STROKE
                strokeWidth = stroke
                strokeCap = Paint.Cap.ROUND
            }
            val sweep = (pct / 100f) * 360f
            canvas.drawArc(rect, -90f, sweep, false, fillPaint)
        }
        return bitmap
    }

    private fun renderCutoffBarBitmap(
        percentage: Double,
        target: Double,
        isZeroState: Boolean,
        trackColor: Int,
        fillColor: Int,
        notchColor: Int,
        widthPx: Int = 600,
        heightPx: Int = 34
    ): Bitmap {
        val bitmap = Bitmap.createBitmap(widthPx, heightPx, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val barTop = heightPx * 0.22f
        val barBottom = heightPx * 0.78f
        val barRadius = (barBottom - barTop) / 2f

        val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = trackColor
            style = Paint.Style.FILL
        }
        val trackRect = RectF(0f, barTop, widthPx.toFloat(), barBottom)
        canvas.drawRoundRect(trackRect, barRadius, barRadius, trackPaint)

        val pct = if (isZeroState) 0f else percentage.toFloat().coerceIn(0f, 100f)
        if (pct > 0f) {
            val fillWidth = (pct / 100f) * widthPx
            val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = fillColor
                style = Paint.Style.FILL
            }
            val fillRect = RectF(0f, barTop, fillWidth.coerceAtLeast(barRadius * 2f), barBottom)
            canvas.drawRoundRect(fillRect, barRadius, barRadius, fillPaint)
        }

        // Target Cutoff Notch
        val notchPct = target.toFloat().coerceIn(0f, 100f)
        val notchWidth = 7f
        val notchX = ((notchPct / 100f) * widthPx).coerceIn(notchWidth / 2f, widthPx - notchWidth / 2f)
        val notchPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = notchColor
            style = Paint.Style.FILL
        }
        val notchRect = RectF(
            notchX - notchWidth / 2f,
            2f,
            notchX + notchWidth / 2f,
            heightPx - 2f
        )
        canvas.drawRoundRect(notchRect, 3.5f, 3.5f, notchPaint)

        return bitmap
    }

    @Composable
    private fun RadialArcCard(
        subject: WidgetSubjectItem,
        isAutoMode: Boolean,
        isDark: Boolean,
        palette: SubjectTierPalette,
        onClick: androidx.glance.action.Action
    ) {
        val isZero = subject.totalHeld == 0
        val arcBitmap = renderRadialArcBitmap(
            percentage = subject.percentage,
            isZeroState = isZero,
            trackColor = palette.trackInt,
            fillColor = palette.fillInt
        )
        val subjectColor = parseSubjectColor(subject.subjectColor)

        Box(
            modifier = GlanceModifier
                .fillMaxSize()
                .cornerRadius(28.dp)
                .background(palette.bg)
                .padding(12.dp)
                .clickable(onClick)
        ) {
            Column(
                modifier = GlanceModifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Top Row: Subject Initial Tile + Code + Optional Auto Badge
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = GlanceModifier
                            .size(22.dp)
                            .cornerRadius(7.dp)
                            .background(subjectColor),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = subject.subjectCode.take(2).uppercase(),
                            style = TextStyle(
                                color = ColorProvider(Color.White),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                    Spacer(modifier = GlanceModifier.width(6.dp))
                    Text(
                        text = subject.subjectCode,
                        style = TextStyle(
                            color = ColorProvider(palette.text),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        maxLines = 1,
                        modifier = GlanceModifier.defaultWeight()
                    )
                    if (isAutoMode) {
                        AutoBadge(isDark = isDark)
                    }
                }

                Spacer(modifier = GlanceModifier.defaultWeight())

                // Center: Radial Arc Gauge + Percentage + Fraction
                Box(
                    modifier = GlanceModifier.size(82.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        provider = ImageProvider(arcBitmap),
                        contentDescription = "${subject.subjectName} ${formatDisplayPct(subject)}",
                        modifier = GlanceModifier.fillMaxSize()
                    )
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = formatDisplayPct(subject),
                            style = TextStyle(
                                color = ColorProvider(palette.text),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            text = "${subject.attended}/${subject.totalHeld}",
                            style = TextStyle(
                                color = ColorProvider(palette.subtext),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Medium
                            )
                        )
                    }
                }

                Spacer(modifier = GlanceModifier.defaultWeight())

                // Bottom: Status Pill
                Box(
                    modifier = GlanceModifier
                        .cornerRadius(999.dp)
                        .background(palette.badgeBg)
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = subject.statusLabel,
                        style = TextStyle(
                            color = ColorProvider(palette.badgeText),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        maxLines = 1
                    )
                }
            }
        }
    }

    @Composable
    private fun HeroCapsuleCard(
        subject: WidgetSubjectItem,
        isAutoMode: Boolean,
        isDark: Boolean,
        palette: SubjectTierPalette,
        onClick: androidx.glance.action.Action
    ) {
        val isZero = subject.totalHeld == 0
        val barBitmap = renderCutoffBarBitmap(
            percentage = subject.percentage,
            target = subject.effectiveTarget,
            isZeroState = isZero,
            trackColor = palette.trackInt,
            fillColor = palette.fillInt,
            notchColor = palette.notchInt
        )
        val subjectColor = parseSubjectColor(subject.subjectColor)

        Box(
            modifier = GlanceModifier
                .fillMaxSize()
                .cornerRadius(28.dp)
                .background(palette.bg)
                .padding(14.dp)
                .clickable(onClick)
        ) {
            Column(modifier = GlanceModifier.fillMaxSize()) {
                // Header: Subject Tile + Name + Code/Fraction + Optional Auto Badge
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = GlanceModifier
                            .size(28.dp)
                            .cornerRadius(9.dp)
                            .background(subjectColor),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = subject.subjectCode.take(2).uppercase(),
                            style = TextStyle(
                                color = ColorProvider(Color.White),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                    Spacer(modifier = GlanceModifier.width(8.dp))
                    Column(modifier = GlanceModifier.defaultWeight()) {
                        Text(
                            text = subject.subjectName,
                            style = TextStyle(
                                color = ColorProvider(palette.text),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            ),
                            maxLines = 1
                        )
                        Text(
                            text = "${subject.subjectCode} · ${subject.attended}/${subject.totalHeld}",
                            style = TextStyle(
                                color = ColorProvider(palette.subtext),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium
                            ),
                            maxLines = 1
                        )
                    }
                    if (isAutoMode) {
                        Spacer(modifier = GlanceModifier.width(6.dp))
                        AutoBadge(isDark = isDark)
                    }
                }

                Spacer(modifier = GlanceModifier.defaultWeight())

                // Middle: Hero Percentage + Status Pill
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.Bottom
                ) {
                    Text(
                        text = formatDisplayPct(subject),
                        style = TextStyle(
                            color = ColorProvider(palette.text),
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Spacer(modifier = GlanceModifier.defaultWeight())
                    Box(
                        modifier = GlanceModifier
                            .cornerRadius(999.dp)
                            .background(palette.badgeBg)
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text(
                            text = subject.statusLabel,
                            style = TextStyle(
                                color = ColorProvider(palette.badgeText),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            ),
                            maxLines = 1
                        )
                    }
                }

                Spacer(modifier = GlanceModifier.height(6.dp))

                // Bottom: Cutoff-Notch Bar + Target Caption
                Image(
                    provider = ImageProvider(barBitmap),
                    contentDescription = "Progress toward ${subject.effectiveTarget.roundToInt()}% target",
                    contentScale = ContentScale.FillBounds,
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .height(14.dp)
                )
                Spacer(modifier = GlanceModifier.height(3.dp))
                Row(modifier = GlanceModifier.fillMaxWidth()) {
                    Text(
                        text = "Target ${subject.effectiveTarget.roundToInt()}%",
                        style = TextStyle(
                            color = ColorProvider(palette.subtext),
                            fontSize = 10.5.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                    Spacer(modifier = GlanceModifier.defaultWeight())
                    Text(
                        text = palette.tierLabel,
                        style = TextStyle(
                            color = ColorProvider(palette.badgeText),
                            fontSize = 10.5.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }
    }

    @Composable
    private fun SlimStripCard(
        subject: WidgetSubjectItem,
        isAutoMode: Boolean,
        isDark: Boolean,
        palette: SubjectTierPalette,
        onClick: androidx.glance.action.Action
    ) {
        val isZero = subject.totalHeld == 0
        val barBitmap = renderCutoffBarBitmap(
            percentage = subject.percentage,
            target = subject.effectiveTarget,
            isZeroState = isZero,
            trackColor = palette.trackInt,
            fillColor = palette.fillInt,
            notchColor = palette.notchInt
        )
        val subjectColor = parseSubjectColor(subject.subjectColor)

        Box(
            modifier = GlanceModifier
                .fillMaxSize()
                .cornerRadius(22.dp)
                .background(palette.bg)
                .padding(horizontal = 14.dp, vertical = 10.dp)
                .clickable(onClick)
        ) {
            Column(modifier = GlanceModifier.fillMaxSize()) {
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = GlanceModifier
                            .size(24.dp)
                            .cornerRadius(8.dp)
                            .background(subjectColor),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = subject.subjectCode.take(2).uppercase(),
                            style = TextStyle(
                                color = ColorProvider(Color.White),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                    Spacer(modifier = GlanceModifier.width(8.dp))
                    Text(
                        text = subject.subjectCode,
                        style = TextStyle(
                            color = ColorProvider(palette.text),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        maxLines = 1
                    )
                    Spacer(modifier = GlanceModifier.width(6.dp))
                    Text(
                        text = "${subject.attended}/${subject.totalHeld}",
                        style = TextStyle(
                            color = ColorProvider(palette.subtext),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        ),
                        maxLines = 1
                    )
                    if (isAutoMode) {
                        Spacer(modifier = GlanceModifier.width(6.dp))
                        AutoBadge(isDark = isDark)
                    }
                    Spacer(modifier = GlanceModifier.defaultWeight())
                    Box(
                        modifier = GlanceModifier
                            .cornerRadius(999.dp)
                            .background(palette.badgeBg)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = subject.statusLabel,
                            style = TextStyle(
                                color = ColorProvider(palette.badgeText),
                                fontSize = 10.5.sp,
                                fontWeight = FontWeight.Bold
                            ),
                            maxLines = 1
                        )
                    }
                    Spacer(modifier = GlanceModifier.width(8.dp))
                    Text(
                        text = formatDisplayPct(subject),
                        style = TextStyle(
                            color = ColorProvider(palette.text),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }

                Spacer(modifier = GlanceModifier.defaultWeight())

                Image(
                    provider = ImageProvider(barBitmap),
                    contentDescription = "Progress toward ${subject.effectiveTarget.roundToInt()}% target",
                    contentScale = ContentScale.FillBounds,
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .height(10.dp)
                )
            }
        }
    }

    @Composable
    private fun AutoBadge(isDark: Boolean) {
        Box(
            modifier = GlanceModifier
                .cornerRadius(999.dp)
                .background(if (isDark) Color(0x2EFFB020) else Color(0x24B26A00))
                .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
            Text(
                text = "AUTO",
                style = TextStyle(
                    color = ColorProvider(if (isDark) Color(0xFFFFB020) else Color(0xFFB26A00)),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold
                )
            )
        }
    }

    @Composable
    private fun EmptySubjectCard(context: Context, isDark: Boolean) {
        val openToday = boundDeepLinkIntent(context, "bound://today")
        val bg = if (isDark) Color(0xFF1B1C21) else Color(0xFFFBFBFD)
        val textPrimary = if (isDark) Color(0xFFF5F5F7) else Color(0xFF111114)
        val textMuted = if (isDark) Color(0xFFA4A4B0) else Color(0xFF6E6E78)

        Box(
            modifier = GlanceModifier
                .fillMaxSize()
                .cornerRadius(28.dp)
                .background(bg)
                .padding(14.dp)
                .clickable(actionStartActivity(openToday)),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Image(
                    provider = ImageProvider(R.drawable.ic_widget_logo),
                    contentDescription = "Bound",
                    modifier = GlanceModifier.size(24.dp)
                )
                Spacer(modifier = GlanceModifier.height(6.dp))
                Text(
                    text = "Open Bound to sync subjects",
                    style = TextStyle(
                        color = ColorProvider(textPrimary),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
                Spacer(modifier = GlanceModifier.height(2.dp))
                Text(
                    text = "Tap to select a course",
                    style = TextStyle(
                        color = ColorProvider(textMuted),
                        fontSize = 10.5.sp
                    )
                )
            }
        }
    }

    @Composable
    private fun LockedSubjectCard(context: Context, isDark: Boolean, isSlim: Boolean) {
        val paywallIntent = boundDeepLinkIntent(context, "bound://paywall?source=subject_widget_locked")
        val bg = if (isDark) Color(0xFF1B1C21) else Color(0xFFFBFBFD)
        val textPrimary = if (isDark) Color(0xFFF5F5F7) else Color(0xFF111114)
        val amber = if (isDark) Color(0xFFFFB020) else Color(0xFFB26A00)

        Box(
            modifier = GlanceModifier
                .fillMaxSize()
                .cornerRadius(if (isSlim) 22.dp else 28.dp)
                .background(bg)
                .padding(12.dp)
                .clickable(actionStartActivity(paywallIntent)),
            contentAlignment = Alignment.Center
        ) {
            if (isSlim) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Image(
                        provider = ImageProvider(R.drawable.ic_widget_lock),
                        contentDescription = "Locked",
                        modifier = GlanceModifier.size(16.dp)
                    )
                    Spacer(modifier = GlanceModifier.width(8.dp))
                    Text(
                        text = "Bound Pro · Unlock Subject Progress Widget",
                        style = TextStyle(
                            color = ColorProvider(amber),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            } else {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Image(
                        provider = ImageProvider(R.drawable.ic_widget_lock),
                        contentDescription = "Locked",
                        modifier = GlanceModifier.size(20.dp)
                    )
                    Spacer(modifier = GlanceModifier.height(6.dp))
                    Text(
                        text = "Subject Progress",
                        style = TextStyle(
                            color = ColorProvider(textPrimary),
                            fontSize = 12.5.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Spacer(modifier = GlanceModifier.height(4.dp))
                    Box(
                        modifier = GlanceModifier
                            .cornerRadius(999.dp)
                            .background(if (isDark) Color(0x28FFB020) else Color(0x1FB26A00))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "Unlock Pro",
                            style = TextStyle(
                                color = ColorProvider(amber),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
            }
        }
    }
}
