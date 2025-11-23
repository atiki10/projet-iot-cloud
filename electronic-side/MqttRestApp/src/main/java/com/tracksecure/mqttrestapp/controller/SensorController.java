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
    public ResponseEntity<List<SensorData>> getSensorHistory() {
        log.info("REST API: Returning sensor data history from MongoDB");
        // Return all data (in a real app, you would use pagination)
        return ResponseEntity.ok(sensorDataRepository.findAll());
    }

    @GetMapping("/sensor/latest-from-db")
    public ResponseEntity<SensorData> getLatestSensorDataFromDb() {
        log.info("REST API: Fetching latest sensor data directly from MongoDB");
        SensorData data = sensorDataRepository.findTopByOrderByIdDesc();
        if (data != null) {
            return ResponseEntity.ok(data);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}