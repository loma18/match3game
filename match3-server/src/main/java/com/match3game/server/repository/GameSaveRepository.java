package com.match3game.server.repository;

import com.match3game.server.model.GameSave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameSaveRepository extends JpaRepository<GameSave, Long> {
    List<GameSave> findByPlayerNameOrderBySavedAtDesc(String playerName);
    Optional<GameSave> findByPlayerNameAndIsActiveTrue(String playerName);
    void deleteByPlayerName(String playerName);
} 