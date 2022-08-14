package com.limonbyte.drcarlosramos.notification;

import android.app.ActivityManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.limonbyte.drcarlosramos.BuildConfig;
import com.limonbyte.drcarlosramos.MainActivity;
import com.limonbyte.drcarlosramos.R;

import java.util.List;

import static android.content.Context.ACTIVITY_SERVICE;

public class NotificationModule extends ReactContextBaseJavaModule implements NotificationEvent {

    private static final String MODULE_NAME = "Notification";
    private static final String CHANNEL_NAME = "Dr. Carlos Ramos";
    private static final String CHANNEL_ID = "dr-carlos-ramos";
    private Context context;

    NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        NotificationReceiver.setNotificationEvent(this);
        context = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void show(String title, String msg) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance);
            channel.setDescription(CHANNEL_NAME);
            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_NAME)
                .setSmallIcon(R.drawable.ic_stat_notification)
                .setColorized(true)
                .setColor(0xF3C32F)
                .setContentTitle(title)
                .setContentText(msg)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setContentIntent(pendingIntent)
                .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        int id = (int) (Math.random() * 1000);
        notificationManager.notify(id, builder.build());
    }

    @ReactMethod
    public void showWithPayload(String title, String msg, ReadableMap payload) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_NAME, CHANNEL_NAME, importance);
            channel.setDescription(CHANNEL_NAME);
            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }

        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.putExtra("Payload", payload.toString());
        int id = (int) (Math.random() * 1000);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, id, intent, PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_NAME)
                .setSmallIcon(R.drawable.ic_stat_notification)
                .setContentTitle(title)
                .setContentText(msg)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        notificationManager.notify(id, builder.build());
    }

    @ReactMethod
    public void clearAll() {
        NotificationManager notificationManager = ((NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE));
        notificationManager.cancelAll();
    }

    @Override
    public void action(String payload) {
        if (!isRunning()) {
            final Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            new Thread(() -> {
                try {
                    Thread.sleep(2000);
                    getReactApplicationContext()
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("Payload", payload);
                } catch (Exception ignored) {
                }
            }).start();
        } else {
            getReactApplicationContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("Payload", payload);
        }
    }

    @Override
    public void destroy() {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("destroy", null);
    }

    private boolean isRunning() {
        ActivityManager activityManager = (ActivityManager) context.getSystemService(ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> processes = activityManager.getRunningAppProcesses();
        for (ActivityManager.RunningAppProcessInfo info : processes) {
            if (BuildConfig.APPLICATION_ID.equalsIgnoreCase(info.processName) && ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND == info.importance)
                return true;
        }
        return false;
    }

}