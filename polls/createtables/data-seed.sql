-- Insert sample data into polls table
INSERT INTO polls (title, category, start_date, end_date, min_reward, max_reward) VALUES
    ('MLA Poll', 'Candidate', '2024-01-20', '2024-01-25', 1, 10),
    ('Party Poll', 'Party', '2024-02-01', '2024-02-07', 2, 9);

-- Insert sample data into questions table
INSERT INTO questions (poll_id, question_type, question_text) VALUES
    (1, 'single', 'Who is your preferred MLA?'),
    (2, 'multiple', 'Which political Party you support?');

-- Insert sample data into options table
INSERT INTO options (question_id, option_text) VALUES
    (1, 'Red'), (1, 'Blue'), (1, 'Green'),
    (2, 'Yellow'), (2, 'Orange'), (2, 'White');

-- Insert sample data into users table
INSERT INTO users (username) VALUES
    ('user1'), ('user2'), ('user3');

-- Insert sample data into votes table
INSERT INTO votes (user_id, poll_id, question_id, option_id) VALUES
    (1, 1, 1, 2),
    (2, 1, 1, 3),
    (3, 2, 2, 4);

-- Insert sample data into poll_analytics table
INSERT INTO poll_analytics (poll_id, total_votes, option_counts) VALUES
    (1, 3, '{"1": 1, "2": 1, "3": 1}'),
    (2, 1, '{"4": 1}');
