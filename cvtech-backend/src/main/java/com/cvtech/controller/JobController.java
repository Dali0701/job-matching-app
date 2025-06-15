package com.cvtech.controller;

import com.cvtech.model.job;
import com.cvtech.service.JobService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;



@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:4200")
public class JobController {
    private static final Logger logger = LoggerFactory.getLogger(JobController.class);
    private final JobService jobService;
    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<?> getAllJobs() {
        try {
            logger.info("Fetching all jobs");
            List<job> jobs = jobService.getAllJobs();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("jobs", jobs);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching jobs: {}", e.getMessage(), e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "SERVER_ERROR", "Failed to retrieve jobs", e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        try {
            logger.info("Fetching job with id: {}", id);
            job job = jobService.getJobById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("job", job);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn(e.getMessage());
            return buildErrorResponse(HttpStatus.NOT_FOUND,
                    "JOB_NOT_FOUND", e.getMessage(), null);
        } catch (Exception e) {
            logger.error("Error fetching job with id {}: {}", id, e.getMessage(), e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "SERVER_ERROR", "Failed to retrieve job", e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody job job) {
        try {
            // Remove the required skills validation check
            job createdJob = jobService.createJob(job);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody job jobDetails) {
        try {
            logger.info("Updating job with id: {}", id);
            
            // Manual validation (replace with @Valid after adding dependency)
            if (jobDetails.getTitle() == null || jobDetails.getTitle().trim().isEmpty()) {
                return buildErrorResponse(HttpStatus.BAD_REQUEST,
                        "INVALID_TITLE", "Job title is required", null);
            }
            
            if (jobDetails.getRequiredSkills() == null || jobDetails.getRequiredSkills().isEmpty()) {
                return buildErrorResponse(HttpStatus.BAD_REQUEST,
                        "REQUIRED_SKILLS_MISSING", "At least one required skill must be specified", null);
            }

            job updatedJob = jobService.updateJob(id, jobDetails);
            logger.info("Updated job with id: {}", id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("job", updatedJob);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn(e.getMessage());
            return buildErrorResponse(HttpStatus.NOT_FOUND,
                    "JOB_NOT_FOUND", e.getMessage(), null);
        } catch (Exception e) {
            logger.error("Error updating job with id {}: {}", id, e.getMessage(), e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "UPDATE_FAILED", "Failed to update job", e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        try {
            logger.info("Deleting job with id: {}", id);
            jobService.deleteJob(id);
            logger.info("Deleted job with id: {}", id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Job deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn(e.getMessage());
            return buildErrorResponse(HttpStatus.NOT_FOUND,
                    "JOB_NOT_FOUND", e.getMessage(), null);
        } catch (Exception e) {
            logger.error("Error deleting job with id {}: {}", id, e.getMessage(), e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "DELETION_FAILED", "Failed to delete job", e.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status, String errorCode, String message, String details) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("error", errorCode);
        response.put("message", message);
        
        if (details != null) {
            response.put("details", details);
        }
        
        return ResponseEntity.status(status).body(response);
    }
}