package com.match3game.server.service.impl;

import com.match3game.server.model.ScoreRecord;
import com.match3game.server.repository.ScoreRecordRepository;
import com.match3game.server.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScoreServiceImpl implements ScoreService {

    private final ScoreRecordRepository scoreRecordRepository;

    @Autowired
    public ScoreServiceImpl(ScoreRecordRepository scoreRecordRepository) {
        this.scoreRecordRepository = scoreRecordRepository;
    }

    @Override
    public ScoreRecord saveScore(ScoreRecord scoreRecord) {
        if (scoreRecord.getCreatedAt() == null) {
            scoreRecord.setCreatedAt(LocalDateTime.now());
        }
        return scoreRecordRepository.save(scoreRecord);
    }

    @Override
    public List<ScoreRecord> getAllScores() {
        return scoreRecordRepository.findAllByOrderByScoreDesc();
    }

    @Override
    public List<ScoreRecord> getScoresByPlayerName(String playerName) {
        return scoreRecordRepository.findByPlayerNameOrderByScoreDesc(playerName);
    }
} 