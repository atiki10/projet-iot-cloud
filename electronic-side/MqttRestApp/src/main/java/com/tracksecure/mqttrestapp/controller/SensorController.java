package com.tracksecure.mqttrestapp.controller;

import com.tracksecure.mqttrestapp.model.SensorData;
import com.tracksecure.mqttrestapp.service.MqttService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tracksecure.mqttrestapp.repository.SensorDataRepository;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow CORS for testing
public class SensorController {

    private final MqttService mqttService;
    private final SensorDataRepository sensorDataRepository;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Service is running");
    }

    @GetMapping("/sensor/latest")
    public ResponseEntity<SensorData> getLatestSensorData() {
        SensorData data = mqttService.getLatestData().get();
        log.info("REST API: Returning latest sensor data");
        return ResponseEntity.ok(data);
    }

    @GetMapping("/sensor/dht")
    public ResponseEntity<?> getDhtData() {
        SensorData data = mqttService.getLatestData().get();
        return ResponseEntity.ok(data.getDhtData());
    }

    @GetMapping("/sensor/gps")
    public ResponseEntity<?> getGpsData() {
        SensorData data = mqttService.getLatestData().get();
        return ResponseEntity.ok(data.getGpsData());
    }

    @GetMapping("/sensor/history")
package com.tracksecure.mqttrestapp.controller;

import com.tracksecure.mqttrestapp.model.SensorData;
import com.tracksecure.mqttrestapp.service.MqttService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tracksecure.mqttrestapp.repository.SensorDataRepository;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow CORS for testing
public class SensorController {

    private final MqttService mqttService;
    private final SensorDataRepository sensorDataRepository;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Service is running");
    }

    @GetMapping("/sensor/latest")
    public ResponseEntity<SensorData> getLatestSensorData() {
        SensorData data = mqttService.getLatestData().get();
        log.info("REST API: Returning latest sensor data");
        return ResponseEntity.ok(data);
    }

    @GetMapping("/sensor/dht")
    public ResponseEntity<?> getDhtData() {
        SensorData data = mqttService.getLatestData().get();
        return ResponseEntity.ok(data.getDhtData());
    }

    @GetMapping("/sensor/gps")
    public ResponseEntity<?> getGpsData() {
        SensorData data = mqttService.getLatestData().get();
        return ResponseEntity.ok(data.getGpsData());
    }

    @GetMapping("/sensor/history")
    public ResponseEntity<List<SensorData>> getSensorHistory() {
        log.info("REST API: Returning sensor data history from MongoDB");
        // Return all data (in a real app, you would use pagination)
        return ResponseEntity.ok(sensorDataRepository.findAll());
    }

    @GetMapping("/sensor/latest-from-db") // Changed from /sensor/latest-from-db to /latest-from-db in snippet, but keeping /sensor prefix for consistency
    public SensorData getLatestSensorDataFromDb() {
        log.info("REST API: Fetching latest sensor data directly from MongoDB");
        // Fetch the most recent record sorted by ID (assuming ID is timestamp-based or auto-increment)
        // Since we don't have a timestamp field in the root, we rely on ID or we can findTopByOrderByIdDesc
        return sensorDataRepository.findTopByOrderByIdDesc().orElse(new SensorData());
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("mqttConnected", mqttService.isConnected());
        status.put("lastError", mqttService.getLastError());
        status.put("lastMessageTime", mqttService.getLastMessageTime());
        status.put("latestData", mqttService.getLatestData().get());
        return status;
    }
}