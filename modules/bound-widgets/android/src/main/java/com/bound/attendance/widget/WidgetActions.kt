package com.bound.attendance.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.RemoteViews
import androidx.glance.GlanceId
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.updateAll

val SessionIdKey = ActionParameters.Key<String>("sessionId")
val TargetStatusKey = ActionParameters.Key<String>("targetStatus")

internal fun boundDeepLinkIntent(context: Context, uri: String): Intent {
    val launchComponent = context.packageManager
        .getLaunchIntentForPackage(context.packageName)
        ?.component
        ?: ComponentName(context.packageName, "com.bound.attendance.MainActivity")

    return Intent(Intent.ACTION_VIEW, Uri.parse(uri)).apply {
        component = launchComponent
        setPackage(context.packageName)
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }
}

internal fun handleGlanceCompositionError(
    context: Context,
    appWidgetId: Int,
    widgetName: String,
    throwable: Throwable
) {
    val cause = throwable.cause ?: throwable
    val detail = "${cause.javaClass.simpleName}: ${cause.message ?: "Unknown error"}"
    Log.e("BoundWidgets", "Composition error in $widgetName (id=$appWidgetId): $detail", throwable)

    try {
        val pendingIntent = PendingIntent.getActivity(
            context,
            appWidgetId,
            boundDeepLinkIntent(context, "bound://today"),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val views = RemoteViews(context.packageName, R.layout.bound_widget_error).apply {
            setTextViewText(R.id.bound_error_title, "Bound · Tap to open")
            setTextViewText(R.id.bound_error_detail, detail)
            setOnClickPendingIntent(R.id.bound_error_root, pendingIntent)
        }
        AppWidgetManager.getInstance(context).updateAppWidget(appWidgetId, views)
    } catch (e: Exception) {
        Log.e("BoundWidgets", "Failed to render error fallback view", e)
    }
}

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
            context.startActivity(boundDeepLinkIntent(context, "bound://paywall?source=widget_action"))
            return
        }

        // 2. Perform Toggle Update
        WidgetStorage.updateSessionStatus(context, sessionId, targetStatus)

        // 3. Immediately redraw both Today and Subject Progress widgets
        BoundTodayWidget().update(context, glanceId)
        try {
            BoundSubjectWidget().updateAll(context)
        } catch (e: Exception) {
            e.printStackTrace()
        }
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
            context.startActivity(boundDeepLinkIntent(context, "bound://paywall?source=widget_batch"))
            return
        }

        // 2. Batch Mark Unmarked
        WidgetStorage.batchMarkAllPresent(context)

        // 3. Redraw both Today and Subject Progress widgets
        BoundTodayWidget().update(context, glanceId)
        try {
            BoundSubjectWidget().updateAll(context)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
