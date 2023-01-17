const { Router } = require('express');
const {
  getAllDogs,
  getDogByIdRaza,
  addDog,
  delDogImage
} = require('../controllers/dogsController');

const dogsRouter = Router();

dogsRouter.get('/', getAllDogs);
dogsRouter.get('/:idRaza', getDogByIdRaza);
dogsRouter.post('/', addDog);
dogsRouter.delete('/:public_id', delDogImage);

module.exports = dogsRouter;