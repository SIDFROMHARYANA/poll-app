// controllers/polls.js
const mysql = require('mysql2');
const pool = mysql.createPool({
    // Configure your MySQL connection
});

// Create a new poll
const createPoll = (req, res) => {
    const { title, category, startDate, endDate, minReward, maxReward } = req.body;

    // Validate the incoming data
    if (!title || !category || !startDate || !endDate || !minReward || !maxReward) {
        return res.status(400).json({ error: 'Invalid data for creating a poll.' });
    }

    // Insert the poll into the database
    pool.query(
        'INSERT INTO polls (title, category, start_date, end_date, min_reward, max_reward) VALUES (?, ?, ?, ?, ?, ?)',
        [title, category, startDate, endDate, minReward, maxReward],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Error creating the poll.' });
            }

            const pollId = results.insertId;
            res.status(201).json({ pollId, message: 'Poll created successfully.' });
        }
    );
};

// Add question set to a poll
const addQuestionSet = (req, res) => {
    const { pollId } = req.params;
    const { questionType, questionText, options } = req.body;

    // Validate the incoming data
    if (!questionType || !questionText || !options) {
        return res.status(400).json({ error: 'Invalid data for adding a question set.' });
    }

    // Check if the poll exists
    pool.query('SELECT * FROM polls WHERE id = ?', [pollId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error checking the poll.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Poll not found.' });
        }

        // Insert the question set into the database
        pool.query(
            'INSERT INTO questions (poll_id, question_type, question_text) VALUES (?, ?, ?)',
            [pollId, questionType, questionText],
            (error, results) => {
                if (error) {
                    return res.status(500).json({ error: 'Error adding the question set.' });
                }

                const questionId = results.insertId;

                const optionsValues = options.map(option => [questionId, option]);
                pool.query(
                    'INSERT INTO options (question_id, option_text) VALUES ?',
                    [optionsValues],
                    (error) => {
                        if (error) {
                            return res.status(500).json({ error: 'Error adding options for the question set.' });
                        }

                        res.status(201).json({ questionId, message: 'Question set added successfully.' });
                    }
                );
            }
        );
    });
};

const getAllPolls = (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Pagination options

    // Fetch polls with details
    pool.query(
        `SELECT 
            polls.id AS pollId, 
            polls.title AS pollTitle, 
            polls.category AS pollCategory, 
            polls.start_date AS startDate, 
            polls.end_date AS endDate, 
            COUNT(votes.id) AS totalVotes, 
            COUNT(DISTINCT questions.id) AS questionSets
         FROM polls
         LEFT JOIN questions ON polls.id = questions.poll_id
         LEFT JOIN votes ON polls.id = votes.poll_id
         GROUP BY polls.id
         LIMIT ?, ?`,
        [(page - 1) * limit, limit],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Error fetching polls.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'No polls found.' });
            }

            // Example: Include details of at least one question for each poll
            const pollsWithDetails = results.map(poll => {
                const { pollId, pollTitle, pollCategory, startDate, endDate, totalVotes, questionSets } = poll;
                return {
                    pollId,
                    pollTitle,
                    pollCategory,
                    startDate,
                    endDate,
                    totalVotes,
                    questionSets,
                    sampleQuestion,
                };
            });

            res.status(200).json({ poll: pollsWithDetails });
        }
    );
};

const updatePoll = (req, res) => {
    const { pollId } = req.params;
    const { title, category, minReward, maxReward, startDate, endDate } = req.body;

    // Validate the incoming data
    if (!pollId) {
        return res.status(400).json({ error: 'PollId parameter is required.' });
    }

    // Construct the SQL query dynamically based on the provided parameters
    const updateParams = [];
    const queryParams = [pollId];

    if (title) {
        updateParams.push('title = ?');
        queryParams.push(title);
    }

    if (category) {
        updateParams.push('category = ?');
        queryParams.push(category);
    }

    if (minReward !== undefined) {
        updateParams.push('min_reward = ?');
        queryParams.push(minReward);
    }

    if (maxReward !== undefined) {
        updateParams.push('max_reward = ?');
        queryParams.push(maxReward);
    }

    if (startDate) {
        updateParams.push('start_date = ?');
        queryParams.push(startDate);
    }

    if (endDate) {
        updateParams.push('end_date = ?');
        queryParams.push(endDate);
    }

    // Check if there are parameters to update
    if (updateParams.length === 0) {
        return res.status(400).json({ error: 'No valid parameters provided for updating the poll.' });
    }

    // Update poll details in the database
    pool.query(
        `UPDATE polls SET ${updateParams.join(', ')} WHERE id = ?`,
        queryParams,
        (error) => {
            if (error) {
                return res.status(500).json({ error: 'Error updating poll details.' });
            }

            res.status(200).json({ message: 'Poll details updated successfully.' });
        }
    );
};

const updateQuestionSet = (req, res) => {
    const { pollId, questionId } = req.params;
    const { questionText, options, questionType } = req.body;

    // Validate the incoming data
    if (!pollId || !questionId) {
        return res.status(400).json({ error: 'PollId and questionId parameters are required.' });
    }

    // Check if the poll exists
    pool.query('SELECT * FROM polls WHERE id = ?', [pollId], (error, polls) => {
        if (error) {
            return res.status(500).json({ error: 'Error checking the poll.' });
        }

        if (polls.length === 0) {
            return res.status(404).json({ error: 'Poll not found.' });
        }

        // Check if the question set exists
        pool.query(
            'SELECT * FROM questions WHERE id = ? AND poll_id = ?',
            [questionId, pollId],
            (error, questions) => {
                if (error) {
                    return res.status(500).json({ error: 'Error checking the question set.' });
                }

                if (questions.length === 0) {
                    return res.status(404).json({ error: 'Question set not found in the specified poll.' });
                }

                // Construct the SQL query dynamically based on the provided parameters
                const updateParams = [];
                const queryParams = [questionId];

                if (questionText) {
                    updateParams.push('question_text = ?');
                    queryParams.push(questionText);
                }

                if (options) {
                    // Handle the case where options need to be updated
                    updateParams.push('options = ?'); // Update this line based on your actual schema
                    queryParams.push(options);
                }

                if (questionType) {
                    updateParams.push('question_type = ?');
                    queryParams.push(questionType);
                }

               
                // Update question set details in the database
                pool.query(
                    `UPDATE questions SET ${updateParams.join(', ')} WHERE id = ?`,
                    queryParams,
                    (error) => {
                        if (error) {
                            return res.status(500).json({ error: 'Error updating question set details.' });
                        }

                        res.status(200).json({ message: 'Question set details updated successfully.' });
                    }
                );
            }
        );
    });
}



const submitPoll = (req, res) => {
    const { userId } = req.params;
    const { pollId, questionId, optionId } = req.body;

    // Validate the incoming data
    if (!userId || !pollId || !questionId || !optionId) {
        return res.status(400).json({ error: 'UserId, pollId, questionId, and optionId parameters are required.' });
    }

    // Check if the user has already submitted this question in the poll
    pool.query('SELECT * FROM votes WHERE user_id = ? AND poll_id = ? AND question_id = ?', [userId, pollId, questionId], (error, votecheck) => {
        if (error) {
            return res.status(500).json({ error: 'Error checking user votes for the question.' });
        }

        if (votecheck.length > 0) {
            return res.status(400).json({ error: 'User has already submitted this question in the poll.' });
        }

        // Check if the option is valid for the question
        pool.query('SELECT * FROM options WHERE id = ? AND question_id = ?', [optionId, questionId], (error, validOption) => {
            if (error) {
                return res.status(500).json({ error: 'Error checking the validity of the option.' });
            }

            if (validOption.length === 0) {
                return res.status(400).json({ error: 'Invalid option for the question.' });
            }

            // Update user data to indicate completion of the question
            pool.query('INSERT INTO user_polls_completed (user_id, poll_id, question_id) VALUES (?, ?, ?)', [userId, pollId, questionId], (error) => {
                if (error) {
                    return res.status(500).json({ error: 'Error updating user data for the completed question.' });
                }

                // Calculate reward amount within the specified range
                const minReward = 1; // Replace with your actual minimum reward
                const maxReward = 10; // Replace with your actual maximum reward
                const rewardAmount = Math.floor(Math.random() * (maxReward - minReward + 1) + minReward);

                // Update poll analytics for the selected option
                pool.query(
                    'UPDATE poll_analytics SET total_votes = total_votes + 1, option_counts = JSON_SET(option_counts, ?, JSON_UNQUOTE(JSON_SET(option_counts->?, ?, option_counts->>? + 1))) WHERE poll_id = ?',
                    [`$.${optionId}`, `$.${optionId}`, '$', optionId, pollId],
                    (error) => {
                        if (error) {
                            return res.status(500).json({ error: 'Error updating poll analytics.' });
                        }

                        res.status(200).json({ rewardAmount });
                    }
                );
            });
        });
    });
};

const fetchPollAnalytics = (req, res) => {
    const { pollId } = req.params;

    // Validate the incoming data
    if (!pollId) {
        return res.status(400).json({ error: 'PollId parameter is required.' });
    }

    // Fetch poll analytics for the specified poll
    pool.query(
        'SELECT * FROM poll_analytics WHERE poll_id = ?',
        [pollId],
        (error, pollAnalytics) => {
            if (error) {
                return res.status(500).json({ error: 'Error fetching poll analytics.' });
            }

            // Check if poll analytics exist for the specified poll
            if (pollAnalytics.length === 0) {
                return res.status(404).json({ error: 'Poll analytics not found for the specified poll.' });
            }

            // Extract relevant information from poll analytics
            const { total_votes, option_counts } = pollAnalytics[0];

            // Respond with poll analytics
            res.status(200).json({
                pollId,
                totalVotes: total_votes,
                optionCounts: option_counts,
            });
        }
    );
};

const fetchOverallPollAnalytics = (req, res) => {
    // Fetch overall poll analytics
    pool.query(
        'SELECT SUM(total_votes) AS overall_total_votes, JSON_OBJECTAGG(poll_id, option_counts) AS overall_option_counts FROM poll_analytics',
        (error, overallAnalytics) => {
            if (error) {
                return res.status(500).json({ error: 'Error fetching overall poll analytics.' });
            }

            // Extract relevant information from overall analytics
            const { overall_total_votes, overall_option_counts } = overallAnalytics[0];

            // Respond with overall poll analytics
            res.status(200).json({
                overallTotalVotes: overall_total_votes,
                overallOptionCounts: JSON.parse(overall_option_counts),
            });
        }
    );
};
module.exports = {
    createPoll,
    addQuestionSet,
    getAllPolls,
    updatePoll,
    updateQuestionSet,
    submitPoll,
    fetchPollAnalytics,
    fetchOverallPollAnalytics

};
