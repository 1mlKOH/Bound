package com.bound.attendance.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

class BoundSubjectWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = BoundSubjectWidget()

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val pendingSubject = WidgetStorage.consumePendingPinSubject(context)
        if (pendingSubject != null) {
            for (id in appWidgetIds) {
                WidgetStorage.setPinnedSubject(context, id, pendingSubject)
            }
        }
        super.onUpdate(context, appWidgetManager, appWidgetIds)
    }

    override fun onDeleted(context: Context, appWidgetIds: IntArray) {
        for (id in appWidgetIds) {
            WidgetStorage.clearPinnedSubject(context, id)
        }
        super.onDeleted(context, appWidgetIds)
    }
}
