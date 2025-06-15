package com.cvtech.repository;

import com.cvtech.model.job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<job, Long> {
    List<job> findAllByIdIn(List<Long> ids);
}