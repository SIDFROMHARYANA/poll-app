 CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT,
    question_text TEXT NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
    -- Add more fields as needed
);