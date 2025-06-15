package com.cvtech.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;

@Service
public class ChatbotService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String rasaUrl = "http://localhost:5005/webhooks/rest/webhook";

    public String getChatbotResponse(String userMessage) {
        try {
            // Prepare request body
            Map<String, String> request = Map.of("message", userMessage);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            // Call Rasa API
            ResponseEntity<Map[]> response = restTemplate.exchange(rasaUrl, HttpMethod.POST, entity, Map[].class);

            if (response.getBody() != null && response.getBody().length > 0) {
                return response.getBody()[0].get("text").toString();
            }
            return "Sorry, I didn't understand that.";
        } catch (Exception e) {
            System.err.println("Error connecting to Rasa: " + e.getMessage());
            return "Sorry, I couldn't process that request.";
        }
    }
}
