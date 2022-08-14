package com.limonbyte.drcarlosramos.notification;

public interface NotificationEvent {

    void action(String action);

    void destroy();
}
