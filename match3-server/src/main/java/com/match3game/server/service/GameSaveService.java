package com.match3game.server.service;

import com.match3game.server.model.GameSave;

import java.util.List;
import java.util.Optional;

public interface GameSaveService {
    GameSave saveGame(GameSave gameSave);
    Optional<GameSave> loadGame(String playerName);
    List<GameSave> getGameSavesByPlayerName(String playerName);
    void deleteGameSave(Long id);
} 