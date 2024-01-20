 // routes/polls.js
const express = require('express');
const router = express.Router();

// Import necessary modules or functions
const { createPoll, addQuestionSet, getAllPolls, updatePoll, updateQuestionSet, submitPoll, fetchPollAnalytics,
    fetchOverallPollAnalytics } = require('../controllers/polls');

// Create a new poll
router.post('/create', createPoll);

// Add question set to a poll
router.post('/:pollId/addQuestionSet', addQuestionSet);

// Retrieve all created polls
router.get('/all', getAllPolls);

// Update poll details
router.patch('/:pollId/update', updatePoll);

// Update a particular question set
router.patch('/:pollId/questions/:questionId/update', updateQuestionSet);

// Fetch user polls and serve questions
router.post('/user/:pollId/submit', submitPoll);

router.get('/polls/:pollId/analytics', fetchPollAnalytics);

router.get('/polls/:pollId/pollanalytics', fetchOverallPollAnalytics);


module.exports = router;
