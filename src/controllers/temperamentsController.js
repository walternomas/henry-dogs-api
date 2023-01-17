require("dotenv").config();
const { API_URL, API_KEY } = process.env;
const axios = require('axios');
const { Temperament } = require('../db');

const getTemperaments = async (url = `${API_URL}/breeds?api_key=${API_KEY}`) => {
  try {
    const temperamentsData = await axios.get(url);
    let temperamentsMap = temperamentsData.data.map(e => e.temperament).toString();
    temperamentsMap = await temperamentsMap.split(',');
    temperamentsMap = await temperamentsMap.map(e => e.trim());
    const temperaments = [...new Set(temperamentsMap)];
    temperaments.forEach(async (e) => {
      if (e) {
        await Temperament.findOrCreate({
          where: {
            name: e
          },
        })
      }
    })
    console.log('temperaments from API');
  } catch (error) {
    console.error(error);
  }
};

async function getAllTemperaments(req, res, next) {
  try {
    console.log('temperaments from DB');
    const temperaments = await Temperament.findAll({
      order: [
        ['name', 'ASC'],
      ]
    });
    return res.status(200).send(temperaments);
  } catch (error) {
    return next(error);
  };
}

module.exports = {
  getTemperaments,
  getAllTemperaments
}