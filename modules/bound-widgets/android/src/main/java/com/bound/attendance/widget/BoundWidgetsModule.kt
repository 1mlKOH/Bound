package com.bound.attendance.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import androidx.glance.appwidget.updateAll
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

class BoundWidgetsModule : Module() {

    private suspend fun refreshAllWidgets(context: Context) {
        try {
            BoundTodayWidget().updateAll(context)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        try {
            BoundSubjectWidget().updateAll(context)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun definition() = ModuleDefinition {
        Name("BoundWidgets")

        Function("updateSnapshot") { jsonStr: String ->
            val context = appContext.reactContext ?: return@Function false
            WidgetStorage.saveSnapshotJson(context, jsonStr)
            CoroutineScope(Dispatchers.Main).launch {
                refreshAllWidgets(context)
            }
            return@Function true
        }

        Function("setEntitlementStatus") { isPro: Boolean ->
            val context = appContext.reactContext ?: return@Function false
            WidgetStorage.setPro(context, isPro)
            CoroutineScope(Dispatchers.Main).launch {
                refreshAllWidgets(context)
            }
            return@Function true
        }

        Function("getEntitlementStatus") {
            val context = appContext.reactContext ?: return@Function true
            return@Function WidgetStorage.isPro(context)
        }

        AsyncFunction("requestWidgetUpdate") {
            val context = appContext.reactContext ?: return@AsyncFunction false
            runBlocking {
                refreshAllWidgets(context)
            }
            return@AsyncFunction true
        }

        AsyncFunction("pinSubjectWidget") { subjectId: String ->
            val context = appContext.reactContext ?: return@AsyncFunction false
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                return@AsyncFunction false
            }
            val appWidgetManager = AppWidgetManager.getInstance(context)
            if (!appWidgetManager.isRequestPinAppWidgetSupported) {
                return@AsyncFunction false
            }
            WidgetStorage.setPendingPinSubject(context, subjectId.ifBlank { WidgetStorage.AUTO_SUBJECT_ID })
            val provider = ComponentName(context, BoundSubjectWidgetReceiver::class.java)
            return@AsyncFunction appWidgetManager.requestPinAppWidget(provider, null, null)
        }
    }
}
