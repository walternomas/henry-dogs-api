const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const dogsRouter = require('./dogsRouter');
const temperamentsRouter = require('./temperamentsRouter');

const routes = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
routes.use('/dogs', dogsRouter);
routes.use('/temperaments', temperamentsRouter);

routes.all('*', (req, res) => {
  res.status(404).send('Not found');
});

module.exports = routes;
