package com.bound.attendance.widget

import androidx.glance.appwidget.updateAll
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class BoundWidgetsModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("BoundWidgets")

        Function("updateSnapshot") { jsonStr: String ->
            val context = appContext.reactContext ?: return@Function false
            WidgetStorage.saveSnapshotJson(context, jsonStr)
            CoroutineScope(Dispatchers.Main).launch {
                try {
                    BoundTodayWidget().updateAll(context)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            return@Function true
        }

        Function("setEntitlementStatus") { isPro: Boolean ->
            val context = appContext.reactContext ?: return@Function false
            WidgetStorage.setPro(context, isPro)
            CoroutineScope(Dispatchers.Main).launch {
                try {
                    BoundTodayWidget().updateAll(context)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            return@Function true
        }

        Function("getEntitlementStatus") {
            val context = appContext.reactContext ?: return@Function false
            return@Function WidgetStorage.isPro(context)
        }

        AsyncFunction("requestWidgetUpdate") {
            val context = appContext.reactContext ?: return@AsyncFunction false
            try {
                BoundTodayWidget().updateAll(context)
                return@AsyncFunction true
            } catch (e: Exception) {
                e.printStackTrace()
                return@AsyncFunction false
            }
        }
    }
}
