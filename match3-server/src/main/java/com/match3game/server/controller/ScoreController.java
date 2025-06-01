package com.match3game.server.controller;

import com.match3game.server.model.ScoreRecord;
import com.match3game.server.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, 
                               RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ScoreController {

    private final ScoreService scoreService;

    @Autowired
    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @PostMapping
    public ResponseEntity<ScoreRecord> saveScore(@RequestBody ScoreRecord scoreRecord) {
        return ResponseEntity.ok(scoreService.saveScore(scoreRecord));
    }

    @GetMapping
    public ResponseEntity<List<ScoreRecord>> getAllScores() {
        return ResponseEntity.ok(scoreService.getAllScores());
    }

    @GetMapping("/player/{playerName}")
    public ResponseEntity<List<ScoreRecord>> getScoresByPlayerName(@PathVariable String playerName) {
        return ResponseEntity.ok(scoreService.getScoresByPlayerName(playerName));
    }
} 