package com.tracksecure.mqttrestapp.debug;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Debug endpoints kept for development. WebSocket removed — this endpoint
 * now returns a simple confirmation and does not broadcast anything.
 */
@RestController
@RequestMapping("/debug")
public class DebugController {

    @PostMapping("/ws/push")
    public ResponseEntity<String> pushTest() {
        return ResponseEntity.ok("websocket disabled: debug endpoint did not broadcast (use REST polling)");
    }
}
