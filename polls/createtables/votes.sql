
 CREATE TABLE votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    poll_id INT,
    option_id INT,
    vote_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE

);