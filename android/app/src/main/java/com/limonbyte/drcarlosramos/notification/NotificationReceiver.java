package com.limonbyte.drcarlosramos.notification;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import java.util.Objects;

public class NotificationReceiver extends BroadcastReceiver {

    private static NotificationEvent notificationEvent;

    public static final String TAG = NotificationReceiver.class.getSimpleName();

    @Override
    public void onReceive(Context context, Intent intent) {
        try {
            String payload = Objects.requireNonNull(intent.getExtras()).getString("Payload");
            if (notificationEvent != null) {
                notificationEvent.action(payload);
            }
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
    }

    public static void setNotificationEvent(NotificationEvent notificationEvent) {
        NotificationReceiver.notificationEvent = notificationEvent;
    }
}