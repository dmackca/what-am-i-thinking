const express = require('express');
const path = require('path');

const router = express.Router();

// serve homepage
router.get('/', (req, res) => {
    res.render('index', {});
});

// serve game pages
router.get('/game/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

module.exports = router;
