package com.tracksecure.mqttrestapp.websocket;

/**
 * WebSocket support removed. This class was previously responsible for handling
 * WebSocket sessions and broadcasting SensorData to connected clients. It has
 * been intentionally left as a no-op placeholder to avoid compilation errors
 * in case of lingering references during migration to AJAX polling.
 */
public final class SensorWebSocketHandler {
    private SensorWebSocketHandler() {}
}
