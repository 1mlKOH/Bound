# Keep BoundWidgets Expo module, receivers, config activity, and Glance ActionCallbacks
-keep class com.bound.attendance.widget.** { *; }

# Keep WorkManager Room database implementation & workers (required by Jetpack Glance)
-keep class androidx.work.impl.WorkDatabase_Impl { *; }
-keep class * extends androidx.room.RoomDatabase { *; }
-keep class * extends androidx.work.ListenableWorker { *; }
-keep class androidx.work.WorkerParameters { *; }
-keepclassmembers class * extends androidx.work.ListenableWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}

# Keep Jetpack Glance & AppWidget reflection targets
-keep class androidx.glance.** { *; }
-keep class * extends androidx.glance.appwidget.action.ActionCallback { *; }
-keep class * extends androidx.glance.appwidget.GlanceAppWidgetReceiver { *; }
