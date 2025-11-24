package com.tracksecure.iotgatewayservice.repository;

import com.tracksecure.iotgatewayservice.model.EnrichedEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorDataRepository extends MongoRepository<EnrichedEvent, String> {
}
