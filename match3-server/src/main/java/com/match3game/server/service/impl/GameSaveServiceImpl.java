package com.match3game.server.service.impl;

import com.match3game.server.model.GameSave;
import com.match3game.server.repository.GameSaveRepository;
import com.match3game.server.service.GameSaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GameSaveServiceImpl implements GameSaveService {

    private final GameSaveRepository gameSaveRepository;

    @Autowired
    public GameSaveServiceImpl(GameSaveRepository gameSaveRepository) {
        this.gameSaveRepository = gameSaveRepository;
    }

    @Override
    @Transactional
    public GameSave saveGame(GameSave gameSave) {
        // Set saved time
        if (gameSave.getSavedAt() == null) {
            gameSave.setSavedAt(LocalDateTime.now());
        }
        
        // Mark as active
        gameSave.setActive(true);
        
        // Deactivate any existing active saves for this player
        Optional<GameSave> existingActiveSave = gameSaveRepository.findByPlayerNameAndIsActiveTrue(gameSave.getPlayerName());
        existingActiveSave.ifPresent(save -> {
            save.setActive(false);
            gameSaveRepository.save(save);
        });
        
        return gameSaveRepository.save(gameSave);
    }

    @Override
    public Optional<GameSave> loadGame(String playerName) {
        return gameSaveRepository.findByPlayerNameAndIsActiveTrue(playerName);
    }

    @Override
    public List<GameSave> getGameSavesByPlayerName(String playerName) {
        return gameSaveRepository.findByPlayerNameOrderBySavedAtDesc(playerName);
    }

    @Override
    public void deleteGameSave(Long id) {
        gameSaveRepository.deleteById(id);
    }
} 