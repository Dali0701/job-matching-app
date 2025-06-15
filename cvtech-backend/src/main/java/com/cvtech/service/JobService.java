package com.cvtech.service;

import com.cvtech.model.job;
import com.cvtech.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class JobService {
    private static final Logger logger = LoggerFactory.getLogger(JobService.class);
    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public List<job> getAllJobs() throws DataAccessException {
        logger.debug("Fetching all jobs from repository");
        return jobRepository.findAll();
    }

    public Optional<job> getJobById(Long id) throws DataAccessException {
        logger.debug("Fetching job with id: {}", id);
        return jobRepository.findById(id);
    }

    public job createJob(job job) throws DataAccessException, IllegalArgumentException {
        logger.debug("Creating new job: {}", job);
        validateJob(job);
        setDefaultValues(job);
        return jobRepository.save(job);
    }

    public job updateJob(Long id, job jobDetails) throws DataAccessException, IllegalArgumentException {
        logger.debug("Updating job with id: {}", id);
        validateJob(jobDetails);
        
        return jobRepository.findById(id)
                .map(existingJob -> {
                    updateJobFields(existingJob, jobDetails);
                    logger.debug("Saving updated job: {}", existingJob);
                    return jobRepository.save(existingJob);
                })
                .orElseThrow(() -> {
                    logger.warn("Job not found with id: {}", id);
                    return new RuntimeException("Job not found with id: " + id);
                });
    }

    public void deleteJob(Long id) throws DataAccessException {
        logger.debug("Deleting job with id: {}", id);
        if (!jobRepository.existsById(id)) {
            logger.warn("Attempt to delete non-existent job with id: {}", id);
            throw new RuntimeException("Job not found with id: " + id);
        }
        jobRepository.deleteById(id);
    }

    private void validateJob(job job) throws IllegalArgumentException {
        if (job.getTitle() == null || job.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Job title is required");
        }
        if (job.getCompany() == null || job.getCompany().trim().isEmpty()) {
            throw new IllegalArgumentException("Company name is required");
        }
        if (job.getRequiredSkills() == null || job.getRequiredSkills().trim().isEmpty()) {
            throw new IllegalArgumentException("At least one required skill must be specified");
        }
    }

    private void setDefaultValues(job job) {
        if (job.getJobType() == null) {
            job.setJobType("Full-time");
        }
        if (job.getLocation() == null) {
            job.setLocation("Remote");
        }
        if (job.getSalaryRange() == null) {
            job.setSalaryRange("Not specified");
        }
        if (job.getPostedDate() == null) {
            job.setPostedDate(LocalDate.now());
        }
        if (job.getPreferredSkills() == null) {
            job.setPreferredSkills("");
        }
        if (job.getExperienceRequired() < 0) {
            job.setExperienceRequired(0);
        }
    }

    private void updateJobFields(job existingJob, job newDetails) {
        existingJob.setTitle(newDetails.getTitle());
        existingJob.setCompany(newDetails.getCompany());
        existingJob.setDescription(newDetails.getDescription());
        existingJob.setRequiredSkills(newDetails.getRequiredSkills());
        existingJob.setPreferredSkills(newDetails.getPreferredSkills());
        existingJob.setExperienceRequired(newDetails.getExperienceRequired());
        existingJob.setJobType(newDetails.getJobType());
        existingJob.setLocation(newDetails.getLocation());
        existingJob.setSalaryRange(newDetails.getSalaryRange());
        existingJob.setPostedDate(newDetails.getPostedDate());
    }
    public List<job> getJobsByIds(List<Long> ids) {
        return jobRepository.findAllById(ids);
    }
}