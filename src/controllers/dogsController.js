require("dotenv").config();
const { API_URL, API_KEY, CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;
const axios = require("axios");
const { Dog, Temperament } = require('../db');
const { conn, Op } = require('../db');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET
});

const getFromApi = async () => {
  const api = await axios(`${API_URL}/breeds?api_key=${API_KEY}`);
  const dogList = await api.data.map(e => {

    let heightMin = e.height.metric.split('-')[0] ?
      (
        e.height.metric.split('-')[0].trim().toLowerCase() === "nan" ?
          "0" :
          e.height.metric.split('-')[0].trim()
      ) :
      "0";
    let heightMax = e.height.metric.split('-')[1] ?
      (
        e.height.metric.split('-')[1].trim().toLowerCase() === "nan" ?
          "0" :
          e.height.metric.split('-')[1].trim()
      ) :
      "0";
    let weightMin = e.weight.metric.split('-')[0] ?
      (
        e.weight.metric.split('-')[0].trim().toLowerCase() === "nan" ?
          (
            Math.ceil(Math.ceil(e.weight.imperial?.split('–')[0].trim()) / 2.2046).toString().toLowerCase() === "nan" ?
              "0" :
              Math.ceil(Math.ceil(e.weight.imperial?.split('–')[0].trim()) / 2.2046).toString()
          ) :
          e.weight.metric.split('-')[0].trim()
      ) :
      "0";
    let weightMax = e.weight.metric.split('-')[1] ?
      (
        e.weight.metric.split('-')[1].trim().toLowerCase() === "nan" ?
          "0" :
          e.weight.metric.split('-')[1].trim()
      ) :
      (
        e.weight.imperial?.split('–')[1] ?
          Math.ceil(Math.ceil(e.weight.imperial?.split('–')[1].trim()) / 2.2046).toString() :
          "0"
      )
    heightMin = heightMin === "0" ? heightMax : heightMin;
    heightMax = heightMax === "0" ? heightMin : heightMax;
    weightMin = weightMin === "0" ? weightMax : weightMin;
    weightMax = weightMax === "0" ? weightMin : weightMax;
    return {
      id: e.id,
      name: e.name,
      height_min: heightMin,
      height_max: heightMax,
      weight_min: weightMin,
      weight_max: weightMax,
      life_span: e.life_span,
      temperament: e.temperament ? e.temperament : "Data is not available.",
      image: e.image.url,
    }
  })
  return dogList;
}

const getFromDB = async () => {
  return await Dog.findAll({
    include: {
      model: Temperament,
      attributes: ['name'],
      through: {
        attributes: [],
      },
    },
  });
}

const getAll = async () => {
  const api = await getFromApi();
  const db = await getFromDB();
  const all = api.concat(db);

  return all;
};

async function getAllDogs(req, res, next) {
  const allDog = await getAll();
  const name = req.query.name;
  if (name) {
    let dogName = await allDog.filter(
      e => e.name.toLowerCase().includes(name.toLocaleLowerCase())
    );
    dogName ?
      res.status(200).send(dogName) :
      res.status(404).send('Name not found');
  } else {
    res.status(200).send(allDog);
  }
}

async function getDogByIdRaza(req, res, next) {
  const { idRaza } = req.params;
  const allDog = await getAll();
  if (idRaza) {
    let dogId = await allDog.filter(e => e.id == idRaza);
    dogId.length ?
      res.status(200).send(dogId) :
      res.status(404).send('Id not found');
  };
};

async function addDog(req, res, next) {
  if (req.body &&
    req.body.name?.trim() !== '' &&
    req.body.height_min?.trim() !== '' &&
    req.body.height_max?.trim() !== '' &&
    req.body.weight_min?.trim() !== '' &&
    req.body.weight_max?.trim() !== '' &&
    req.body.life_span_min?.trim() !== '' &&
    req.body.life_span_max?.trim() !== '' &&
    req.body.temperaments?.length > 0) {
    try {
      const result = await conn.transaction(async (t) => {
        const { temperaments } = req.body;
        const dog = await Dog.create({
          name: req.body.name.trim(),
          height_min: req.body.height_min.trim(),
          height_max: req.body.height_max.trim(),
          weight_min: req.body.weight_min.trim(),
          weight_max: req.body.weight_max.trim(),
          life_span: req.body.life_span_min.trim() + " - " + req.body.life_span_max.trim() + " years",
          image: req.body.image?.trim(),
        }, { transaction: t });
        if (temperaments?.length > 0) {
          await dog.addTemperaments(temperaments, { transaction: t });
        }
        return res.status(201).json({ message: 'Dog created successfully.' });
      });
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).send({ "error": "Invalid body" });
  }
}

const delDogImage = async (req, res, next) => {
  const { public_id } = req.params;
  try {
    await cloudinary.uploader.destroy(public_id);
    res.status(200).send();
  } catch (err) {
    res.status(400).send();
  }
};

module.exports = {
  addDog,
  getDogByIdRaza,
  getAllDogs,
  delDogImage,
}