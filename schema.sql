-- Schema for the Kuvia project

-- Delete and create database
DROP DATABASE IF EXISTS kuvia;
CREATE DATABASE kuvia;
USE kuvia;

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Media table (images)
CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    image VARCHAR(500) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    isPrivate BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_code (code),
    INDEX idx_userId (userId)
);

-- Likes table
CREATE TABLE likes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    userId INTEGER NOT NULL,
    mediaId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mediaId) REFERENCES media(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (userId, mediaId),
    INDEX idx_userId (userId),
    INDEX idx_mediaId (mediaId)
);

-- Comments table
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    userId INTEGER NOT NULL,
    mediaId INTEGER NOT NULL,
    text TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mediaId) REFERENCES media(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_mediaId (mediaId),
    INDEX idx_createdAt (createdAt)
);

-- Tags table
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Media tags junction table (many-to-many relationship)
CREATE TABLE media_tags (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    mediaId INTEGER NOT NULL,
    tagId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mediaId) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_media_tag (mediaId, tagId),
    INDEX idx_mediaId (mediaId),
    INDEX idx_tagId (tagId)
);

-- Views table
CREATE TABLE views (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    userId INTEGER NOT NULL,
    mediaId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mediaId) REFERENCES media(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_mediaId (mediaId),
    INDEX idx_createdAt (createdAt)
);
