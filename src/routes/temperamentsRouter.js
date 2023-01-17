const { Router } = require('express');
const { getAllTemperaments } = require('../controllers/temperamentsController');

const temperamentsRouter = Router();

temperamentsRouter.get('/', getAllTemperaments);

module.exports = temperamentsRouter;