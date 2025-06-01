package com.match3game.server.repository;

import com.match3game.server.model.ScoreRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRecordRepository extends JpaRepository<ScoreRecord, Long> {
    List<ScoreRecord> findAllByOrderByScoreDesc();
    List<ScoreRecord> findByPlayerNameOrderByScoreDesc(String playerName);
} 