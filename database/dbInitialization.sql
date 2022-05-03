CREATE DATABASE "2PSudoku"

USE DATABASE "2PSudoku"

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS games;

CREATE TYPE difficultyTypes AS ENUM('easy', 'medium', 'hard', 'evil');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(80) NOT NULL,
  password VARCHAR(80) NOT NULL,
  rating NUMERIC NOT NULL,
  difficulty difficultyTypes 
);

CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  p1_id VARCHAR(50) NOT NULL,
  p2_id VARCHAR(50) NOT NULL,
  gametime TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  p1_rating INT NOT NULL,
  p2_rating INT NOT NULL,
  p1_mistakes  SMALLINT DEFAULT 0,
  p2_mistakes SMALLINT DEFAULT 0,
  is_finished BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (p1_rating) REFERENCES users(id),
  FOREIGN KEY (p2_rating) REFERENCES users(id)
);

