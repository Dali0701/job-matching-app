package com.cvtech.service;

import com.cvtech.model.JobMatch;
import com.cvtech.repository.JobMatchRepository;
import org.springframework.stereotype.Service;

@Service
public class JobMatchService {

    private final JobMatchRepository jobMatchRepository;

    public JobMatchService(JobMatchRepository jobMatchRepository) {
        this.jobMatchRepository = jobMatchRepository;
    }

    public JobMatch saveJobMatch(String candidateId, Integer jobId, Double matchPercentage) {
        JobMatch jobMatch = new JobMatch();
        jobMatch.setCandidateId(candidateId);
        jobMatch.setJobId(jobId);
        jobMatch.setMatchPercentage(matchPercentage);
        
        return jobMatchRepository.save(jobMatch);
    }
}