package com.cvtech.controller;

import com.cvtech.model.JobMatch;
import com.cvtech.service.JobMatchService;
import com.cvtech.repository.JobMatchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/job-matches")
public class JobMatchController {

    private final JobMatchService jobMatchService;
    private final JobMatchRepository jobMatchRepository;

    public JobMatchController(JobMatchRepository jobMatchRepository,JobMatchService jobMatchService) {
        this.jobMatchRepository = jobMatchRepository;
        this.jobMatchService = jobMatchService;
    }

    @PostMapping
    public ResponseEntity<JobMatch> createJobMatch(
            @RequestParam String candidateId,
            @RequestParam Integer jobId,
            @RequestParam Double matchPercentage) {
        
        JobMatch savedMatch = jobMatchService.saveJobMatch(candidateId, jobId, matchPercentage);
        return ResponseEntity.ok(savedMatch);
    }

    @GetMapping
    public ResponseEntity<List<JobMatch>> getAllJobMatches() {
        List<JobMatch> matches = jobMatchRepository.findAll();
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobMatch>> searchJobMatches(
            @RequestParam(required = false) String candidateId) {
        
        List<JobMatch> matches;
        if (candidateId != null && !candidateId.isEmpty()) {
            matches = jobMatchRepository.findByCandidateId(candidateId);
        } else {
            matches = jobMatchRepository.findAll();
        }
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobMatch> getJobMatchById(@PathVariable Long id) {
        return jobMatchRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobMatch(@PathVariable Long id) {
        if (!jobMatchRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jobMatchRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}