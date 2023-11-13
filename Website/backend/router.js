const express = require('express');
const router = express.Router();
const getPlaces = require('./get_places').getPlaces;

router.get("/api/getPlaces", getPlaces);

module.exports = router;