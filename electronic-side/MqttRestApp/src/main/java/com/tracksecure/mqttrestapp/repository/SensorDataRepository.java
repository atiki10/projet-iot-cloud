package com.tracksecure.mqttrestapp.repository;

import com.tracksecure.mqttrestapp.model.SensorData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorDataRepository extends MongoRepository<SensorData, String> {
    SensorData findTopByOrderByIdDesc();
}
