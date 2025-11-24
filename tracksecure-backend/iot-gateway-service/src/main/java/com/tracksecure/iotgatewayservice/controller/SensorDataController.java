package com.tracksecure.iotgatewayservice.controller;

import com.tracksecure.iotgatewayservice.model.EnrichedEvent;
import com.tracksecure.iotgatewayservice.repository.SensorDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sensor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SensorDataController {
    private final SensorDataRepository repository;

    @GetMapping("/latest-from-db")
    public ResponseEntity<EnrichedEvent> getLatest() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "eventTimestamp"))
                .stream().findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
