package com.cvtech.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "job")
public class job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    @NotBlank(message = "Job title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;
    
    @Column(nullable = false)
    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    private String company;
    
    @Column(length = 2000)
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;
    
    @Column(name = "required_skills", nullable = false, length = 1000)
    @NotBlank(message = "At least one required skill must be specified")
    @Pattern(regexp = "^[a-zA-Z0-9, ]+$", message = "Skills can only contain letters, numbers, and commas")
    private String requiredSkills = "";
    
    @Column(name = "preferred_skills", length = 1000)
    @Pattern(regexp = "^[a-zA-Z0-9, ]*$", message = "Skills can only contain letters, numbers, and commas")
    private String preferredSkills = "";
    
    @Column(name = "experience_required", nullable = false)
    @Min(value = 0, message = "Experience cannot be negative")
    @Max(value = 50, message = "Experience cannot exceed 50 years")
    private int experienceRequired = 0;
    
    @Column(name = "job_type", nullable = false)
    @NotBlank(message = "Job type is required")
    private String jobType = "Full-time";
    
    @Column(nullable = false)
    @NotBlank(message = "Location is required")
    private String location = "Remote";
    
    @Column(name = "salary_range")
    @Size(max = 100, message = "Salary range cannot exceed 100 characters")
    private String salaryRange = "Not specified";
    
    @Column(name = "posted_date", nullable = false)
    @NotNull(message = "Posted date is required")
    private LocalDate postedDate = LocalDate.now();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<String> getRequiredSkillsList() {
        return requiredSkills == null || requiredSkills.isEmpty() ? 
            List.of() : Arrays.asList(requiredSkills.split("\\s*,\\s*"));
    }

    public String getPreferredSkills() {
        return preferredSkills;
    }

    public void setPreferredSkills(String preferredSkills) {
        this.preferredSkills = preferredSkills;
    }

    public List<String> getPreferredSkillsList() {
        return preferredSkills == null || preferredSkills.isEmpty() ? 
            List.of() : Arrays.asList(preferredSkills.split("\\s*,\\s*"));
    }

    public int getExperienceRequired() {
        return experienceRequired;
    }

    public void setExperienceRequired(int experienceRequired) {
        this.experienceRequired = experienceRequired;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSalaryRange() {
        return salaryRange;
    }

    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
    }

    public LocalDate getPostedDate() {
        return postedDate;
    }

    public void setPostedDate(LocalDate postedDate) {
        this.postedDate = postedDate;
    }
}