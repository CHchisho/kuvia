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
    role ENUM('user', 'moderator', 'admin') NOT NULL DEFAULT 'user',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Media table (images)
CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    userId INTEGER NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    image VARCHAR(512) NOT NULL,
    fileHash VARCHAR(64) NOT NULL,
    mimeType VARCHAR(32) NOT NULL,
    description TEXT,
    isPrivate BOOLEAN DEFAULT FALSE,
    expiresAt DATETIME NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_code (code),
    INDEX idx_userId (userId),
    INDEX idx_user_hash (userId, fileHash),
    INDEX idx_expiresAt (expiresAt)
);

-- Votes table (upvotes/downvotes)
CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    userId INTEGER NOT NULL,
    mediaId INTEGER NOT NULL,
    type ENUM('upvote', 'downvote') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mediaId) REFERENCES media(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote (userId, mediaId),
    INDEX idx_userId (userId),
    INDEX idx_mediaId (mediaId),
    INDEX idx_type (type)
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

-- Moderation log (admin/moderator actions)
CREATE TABLE moderation_log (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    userId INTEGER NOT NULL,
    action VARCHAR(64) NOT NULL,
    mediaId INTEGER,
    mediaCode VARCHAR(20),
    details TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_action (action),
    INDEX idx_mediaId (mediaId),
    INDEX idx_createdAt (createdAt)
);
