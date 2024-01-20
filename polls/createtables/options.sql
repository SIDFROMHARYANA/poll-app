CREATE TABLE options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poll_id INT,
    question_id INT,
    option_text VARCHAR(255) NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    -- Add more fields as needed
);