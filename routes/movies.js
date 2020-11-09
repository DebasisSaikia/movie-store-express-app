const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Movie = require("../models/movie");
const uploadPath = path.join("public", Movie.coverPosterBasePath);
const Director = require("../models/director");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// file upload
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

router.get("/", async (req, res) => {
  let query = Movie.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.releasedBefore != null && req.query.releasedBefore != "") {
    query = query.lte("releaseDate", req.query.releasedBefore);
  }
  if (req.query.releasedAfter != null && req.query.releasedAfter != "") {
    query = query.gte("releaseDate", req.query.releasedAfter);
  }
  try {
    const movies = await query.exec();
    res.render("movies/index", {
      movies: movies,
      searchResults: req.query,
    });
  } catch {
    res.redirect("/movies");
  }
});

router.get("/new", async (req, res) => {
  // try {
  //   const directors = await Director.find({});
  //   const movie = new Movie();
  //   res.render("movies/new", {
  //     directors: directors,
  //     movie: movie,
  //   });
  // } catch (err) {
  //   res.render("/movies");
  // }

  renderNewPage(res, new Movie());
});

router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;

  const movie = new Movie({
    title: req.body.title,
    director: req.body.director,
    releaseDate: new Date(req.body.releaseDate),
    ratingCount: req.body.ratingCount,
    coverPoster: fileName,
    description: req.body.description,
  });
  try {
    const newMovie = await movie.save();
    res.redirect("movies");
  } catch {
    if (movie.coverPoster != null) {
      removeCover(movie.coverPoster);
    }
    renderNewPage(res, movie, true);
  }
});

function removeCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), (err) => {
    if (err) console.log(err);
  });
}

async function renderNewPage(res, movie, isError = false) {
  try {
    const directors = await Director.find({});
    const params = {
      directors: directors,
      movie: movie,
    };
    if (isError) params.errorMessage = "Error in creating Book";
    res.render("movies/new", params);
  } catch {
    res.redirect("/movies");
  }
}

module.exports = router;
