CREATE TABLE polls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_votes INT DEFAULT 0,
    question_sets_count INT DEFAULT 0
    -- Add more fields as needed
);