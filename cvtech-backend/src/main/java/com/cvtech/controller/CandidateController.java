package com.cvtech.controller;

import com.cvtech.model.Candidate;
import com.cvtech.service.CandidateService;
import com.cvtech.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.HashMap;


@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "http://localhost:4200")
public class CandidateController {
    
    private final CandidateService candidateService;
    private final FileStorageService fileStorageService;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public CandidateController(CandidateService candidateService, 
                             FileStorageService fileStorageService,
                             RestTemplate restTemplate) {
        this.candidateService = candidateService;
        this.fileStorageService = fileStorageService;
        this.restTemplate = restTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        List<Candidate> candidates = candidateService.getAllCandidates();
        return ResponseEntity.ok(candidates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable Long id) {
        Candidate candidate = candidateService.getCandidateById(id);
        if (candidate != null) {
            return ResponseEntity.ok(candidate);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadCV(
            @RequestParam("cv") MultipartFile file,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("skills") String skills) {
        
        try {
            // 1. Save candidate to database
            String fileName = fileStorageService.storeFile(file);
            String filePath = fileStorageService.getFileStorageLocation() + "/" + fileName;
            
            Candidate candidate = new Candidate();
            candidate.setFirstName(firstName);
            candidate.setLastName(lastName);
            candidate.setEmail(email);
            candidate.setPhone(phone);
            candidate.setSkills(skills);
            candidate.setCvPath(fileName);
            
            Candidate savedCandidate = candidateService.saveCandidate(candidate);

            // 2. Prepare request to FastAPI
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(filePath));
            body.add("first_name", firstName);
            body.add("last_name", lastName);
            body.add("email", email);
            body.add("phone", phone);
            body.add("skills", skills);
            
            // 3. Call FastAPI
            ResponseEntity<Map> response = restTemplate.postForEntity(
                aiServiceUrl + "/parse-cv",
                new HttpEntity<>(body, headers),
                Map.class
            );
            
            // 4. Process response
            Map<String, Object> aiResponse = response.getBody();
            @SuppressWarnings("unchecked")
            List<String> skillsList = (List<String>) aiResponse.get("skills");
            Integer experience = (Integer) aiResponse.get("experience_years");
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("success", true);
            responseBody.put("candidateId", savedCandidate.getId());
            responseBody.put("skills", skillsList);
            responseBody.put("experience", experience);
            
            return ResponseEntity.ok(responseBody);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "PROCESSING_FAILED", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
        public ResponseEntity<?> deleteCandidate(@PathVariable Long id) {
            try {
                candidateService.deleteCandidate(id);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Candidate deleted successfully"
                ));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "success", false,
                        "error", "DELETE_FAILED",
                        "message", e.getMessage()
                    ));
            }
        }

    @GetMapping("/chatbot")
    public ResponseEntity<?> chatWithBot(@RequestParam String message) {
        try {
            String response = candidateService.chatWithBot(message);
            return ResponseEntity.ok(Map.of("success", true, "response", response));
        } catch (Exception e) {
            return serverErrorResponse("CHATBOT_ERROR", e.getMessage());
        }
    }
    
    private ResponseEntity<?> serverErrorResponse(String errorCode, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", errorCode);
        response.put("message", message);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}