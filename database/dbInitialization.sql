CREATE DATABASE "2PSudoku";

USE DATABASE "2PSudoku";

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS boards CASCADE;



-- CREATE TYPE difficultyTypes AS ENUM('easy', 'medium', 'hard', 'evil');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(80) NOT NULL,
  password VARCHAR(80) NOT NULL,
  rating INT NOT NULL,
  difficulty VARCHAR(10),
  board_id BIGINT DEFAULT 0,
  game_id BIGINT DEFAULT 0,
  games_played BIGINT DEFAULT 0,
  highest_rating INT DEFAULT 1000
);

CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  p1_id INT NOT NULL,
  p2_id INT NOT NULL,
  p1_name VARCHAR(80) NOT NULL,
  p2_name VARCHAR(80) NOT NULL,
  p1_rating INT NOT NULL,
  p2_rating INT NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_finished VARCHAR(80),
  FOREIGN KEY (p1_id) REFERENCES users(id),
  FOREIGN KEY (p2_id) REFERENCES users(id)
);

CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL,
  game_id INT NOT NULL,
  gametime TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  holes INT DEFAULT 0,
  player_mistakes SMALLINT DEFAULT 0,
  board_state VARCHAR(200) NOT NULL,
  board_solution VARCHAR(200) NOT NULL,
  answerable_cells VARCHAR(200) NOT NULL,
  FOREIGN KEY (player_id) REFERENCES users(id),
  FOREIGN KEY (game_id) REFERENCES games(id)
);