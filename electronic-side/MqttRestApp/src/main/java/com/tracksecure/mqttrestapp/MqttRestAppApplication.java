package com.tracksecure.mqttrestapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class MqttRestAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(MqttRestAppApplication.class, args);
    }

}
