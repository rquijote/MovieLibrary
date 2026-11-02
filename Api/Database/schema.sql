CREATE DATABASE IF NOT EXISTS movielibrary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE movielibrary;

CREATE TABLE IF NOT EXISTS user_lists (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(2000) NOT NULL DEFAULT ''
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_list_items (
    list_id INT NOT NULL,
    movie_id INT NOT NULL,
    movie_json JSON NOT NULL,
    added_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (list_id, movie_id),
    CONSTRAINT fk_user_list_items_list FOREIGN KEY (list_id) REFERENCES user_lists(id) ON DELETE CASCADE
) ENGINE=InnoDB;