-- create database devquest if not exists
CREATE DATABASE IF NOT EXISTS devquest;
USE devquest;

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    media_url VARCHAR(512),
    media_type ENUM('image', 'video', 'audio', 'none') DEFAULT 'none',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
    message TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_ip VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (post_id, user_ip)
);

-- Insert sample posts
INSERT INTO posts (title, content, media_url, media_type) VALUES
('Text Only Post', 'This is a post with no media.', NULL, 'none'),
('Image Post', 'This post has an image.', 'https://www.omgubuntu.co.uk/wp-content/uploads/2025/08/debian-13.jpg', 'image'),
('Video Post', 'This post has a video.', 'https://youtu.be/y_71yZo8Q_s', 'video');

-- Insert sample comments
INSERT INTO comments (post_id, name, message) VALUES
(1, 'Alice', 'Great post!'),
(1, 'Bob', 'Thanks for sharing.'),
(2, 'Charlie', 'Nice image!'),sudo apt upgr
(2, 'Anonymous', 'Love this picture.'),
(3, 'Dave', 'Cool video!');

-- Insert sample likes
INSERT INTO likes (post_id, user_ip) VALUES
(1, '192.168.1.10'),
(1, '192.168.1.11'),
(2, '192.168.1.12'),
(2, '192.168.1.13'),
(3, '192.168.1.14');