package com.tracksecure.mqttrestapp.repository;

import com.tracksecure.mqttrestapp.model.SensorData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SensorDataRepository extends MongoRepository<SensorData, String> {
    Optional<SensorData> findTopByOrderByIdDesc();
}
