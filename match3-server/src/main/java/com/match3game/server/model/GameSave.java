package com.match3game.server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameSave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String playerName;
    private int score;
    private int level;
    
    @Column(length = 10000)
    private String boardState;
    
    private LocalDateTime savedAt;
    private boolean isActive;
} 