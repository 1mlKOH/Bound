# Keep BoundWidgets Expo module, receivers, config activity, and Glance ActionCallbacks
-keep class com.bound.attendance.widget.** { *; }

# Keep WorkManager & Room database implementation & workers (required by Jetpack Glance SessionWorker)
-keep class androidx.work.** { *; }
-keep class androidx.work.impl.WorkDatabase_Impl { *; }
-keep class * extends androidx.room.RoomDatabase { *; }
-keep class * extends androidx.work.ListenableWorker { *; }
-keep class androidx.work.WorkerParameters { *; }
-keepclassmembers class * extends androidx.work.ListenableWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}

# Keep Jetpack Glance, StateDefinitions, Protobuf, and AppWidget reflection targets
-keep class androidx.glance.** { *; }
-keep class * implements androidx.glance.state.GlanceStateDefinition { *; }
-keepclassmembers class * extends androidx.glance.appwidget.protobuf.GeneratedMessageLite {
    <fields>;
}
-keep public class * extends androidx.glance.appwidget.GlanceAppWidget {
    public <init>();
}
-keep public class * extends androidx.glance.appwidget.GlanceAppWidgetReceiver {
    public <init>();
}
-keep public class * extends androidx.glance.appwidget.action.ActionCallback {
    public <init>();
}

# Keep DataStore Preferences & Protobuf reflection targets (used internally by GlanceAppWidgetManager)
-keep class androidx.datastore.** { *; }
-keepclassmembers class * extends androidx.datastore.preferences.protobuf.GeneratedMessageLite {
    <fields>;
}

# Keep Compose Runtime classes used by Glance composition
-keep class androidx.compose.runtime.** { *; }
