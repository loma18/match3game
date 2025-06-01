package com.match3game.server.service;

import com.match3game.server.model.ScoreRecord;

import java.util.List;

public interface ScoreService {
    ScoreRecord saveScore(ScoreRecord scoreRecord);
    List<ScoreRecord> getAllScores();
    List<ScoreRecord> getScoresByPlayerName(String playerName);
} 