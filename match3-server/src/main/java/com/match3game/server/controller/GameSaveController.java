package com.match3game.server.controller;

import com.match3game.server.model.GameSave;
import com.match3game.server.service.GameSaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/saves")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, 
                               RequestMethod.DELETE, RequestMethod.OPTIONS})
public class GameSaveController {

    private final GameSaveService gameSaveService;

    @Autowired
    public GameSaveController(GameSaveService gameSaveService) {
        this.gameSaveService = gameSaveService;
    }

    @PostMapping
    public ResponseEntity<GameSave> saveGame(@RequestBody GameSave gameSave) {
        return ResponseEntity.ok(gameSaveService.saveGame(gameSave));
    }

    @GetMapping("/player/{playerName}")
    public ResponseEntity<List<GameSave>> getGameSavesByPlayerName(@PathVariable String playerName) {
        List<GameSave> saves = gameSaveService.getGameSavesByPlayerName(playerName);
        return ResponseEntity.ok(saves);
    }

    @GetMapping("/load/{playerName}")
    public ResponseEntity<GameSave> loadGame(@PathVariable String playerName) {
        Optional<GameSave> gameSave = gameSaveService.loadGame(playerName);
        return gameSave.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGameSave(@PathVariable Long id) {
        gameSaveService.deleteGameSave(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
} 