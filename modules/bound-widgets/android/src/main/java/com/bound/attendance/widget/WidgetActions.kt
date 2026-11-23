package com.bound.attendance.widget

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.glance.GlanceId
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.action.ActionCallback

val SessionIdKey = ActionParameters.Key<String>("sessionId")
val TargetStatusKey = ActionParameters.Key<String>("targetStatus")

class MarkSessionAction : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        val sessionId = parameters[SessionIdKey] ?: return
        val targetStatus = parameters[TargetStatusKey] ?: return

        // 1. Paywall Guard
        if (!WidgetStorage.isPro(context)) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("bound://paywall?source=widget_action")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            context.startActivity(intent)
            return
        }

        // 2. Perform Toggle Update
        WidgetStorage.updateSessionStatus(context, sessionId, targetStatus)

        // 3. Immediately redraw the widget
        BoundTodayWidget().update(context, glanceId)
    }
}

class BatchMarkAction : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        // 1. Paywall Guard
        if (!WidgetStorage.isPro(context)) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("bound://paywall?source=widget_batch")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            context.startActivity(intent)
            return
        }

        // 2. Batch Mark Unmarked
        WidgetStorage.batchMarkAllPresent(context)

        // 3. Redraw widget
        BoundTodayWidget().update(context, glanceId)
    }
}
