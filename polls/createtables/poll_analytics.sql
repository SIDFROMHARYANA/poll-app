
 CREATE TABLE poll_analytics (
    poll_id INT PRIMARY KEY,
    total_votes INT DEFAULT 0,
    -- Add more analytics fields as needed
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);