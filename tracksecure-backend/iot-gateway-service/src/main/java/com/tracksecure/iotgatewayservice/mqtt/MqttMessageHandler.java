package com.tracksecure.iotgatewayservice.mqtt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tracksecure.iotgatewayservice.model.DeviceCredential;
import com.tracksecure.iotgatewayservice.model.DeviceMessage;
import com.tracksecure.iotgatewayservice.model.EnrichedEvent;
import com.tracksecure.iotgatewayservice.model.TelemetryPayload;
import com.tracksecure.iotgatewayservice.repository.SensorDataRepository;
import com.tracksecure.iotgatewayservice.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class MqttMessageHandler{
    private final ObjectMapper objectMapper;
    private final DeviceAuthenticationService deviceAuthenticationService;
    private final PayloadValidationService payloadValidationService;
    private final PayloadDecryptionService payloadDecryptionService;
    private final DataEnrichmentService dataEnrichmentService;
    private final SensorDataRepository sensorDataRepository;
    private final IdempotencyService idempotencyService;

    public void handle(String topic, MqttMessage message){
        try {
            String payload = new String(message.getPayload());
            log.debug("Received MQTT message: {}", payload);

            // 1. Parse raw message to DeviceMessage
            DeviceMessage deviceMessage = objectMapper.readValue(payload, DeviceMessage.class);

            // 2. Authenticate Device
            DeviceCredential credential = deviceAuthenticationService.authenticate(deviceMessage.getDeviceId());

            // 3. Decrypt Payload
            String decryptedJson = payloadDecryptionService.decrypt(deviceMessage.getEncryptedPayload(), credential.getSecretKey());

            // 4. Parse Decrypted Payload to TelemetryPayload
            TelemetryPayload telemetryPayload = objectMapper.readValue(decryptedJson, TelemetryPayload.class);

            // 5. Validate Payload
            payloadValidationService.validate(telemetryPayload);

            // 6. Enrich Data
            EnrichedEvent enrichedEvent = dataEnrichmentService.enrich(telemetryPayload, deviceMessage);

            // 7. Save to MongoDB
            sensorDataRepository.save(enrichedEvent);
            log.info("Saved sensor data to MongoDB: {}", enrichedEvent.getEventId());

        }catch (Exception e){
            log.error("Error handling MQTT message", e);
        }
    }
}
