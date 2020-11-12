const express = require("express");
const router = express.Router();
const Movie = require("../models/movie");
const Director = require("../models/director");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

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
    res.redirect("/");
  }
});

router.get("/new", async (req, res) => {
  renderNewPage(res, new Movie());
});

router.post("/", async (req, res) => {
  const movie = new Movie({
    title: req.body.title,
    director: req.body.director,
    releaseDate: new Date(req.body.releaseDate),
    ratingCount: req.body.ratingCount,
    description: req.body.description,
  });

  saveCover(movie, req.body.cover);

  try {
    const newMovie = await movie.save();
    res.redirect(`movies/${newMovie.id}`);
  } catch (err) {
    console.log(err);
    renderNewPage(res, movie, true);
  }
});

// show movie route:
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate("director")
      .exec();
    res.render("movies/show", { movie: movie });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

// Edit movie
router.get("/:id/edit", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    renderEditPage(res, movie);
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

// update movie
router.put("/:id", async (req, res) => {
  let movie;
  try {
    const { title, director, ratingCount, description } = req.body;
    movie = await Movie.findById(req.params.id);
    movie.title = title;
    movie.director = director;
    movie.releaseDate = new Date(req.body.releaseDate);
    movie.ratingCount = ratingCount;
    movie.description = description;

    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(movie, req.body.cover);
    }
    await movie.save();
    res.redirect(`/movies/${movie.id}`);
  } catch {
    if (movie != null) {
      renderEditPage(res, movie, true);
    } else {
      res.redirect("/");
    }
  }
});

// delete routes
router.delete("/:id", async (req, res) => {
  let movie;
  try {
    movie = await Movie.findById(req.params.id);
    await movie.remove();
    res.redirect("/movies");
  } catch {
    if (movie != null) {
      res.render("movies/show", {
        movie: movie,
        errorMessage: "Could not Delete book !! Try again",
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderNewPage(res, movie, isError = false) {
  renderFormPage(res, movie, "new", isError);
}

async function renderEditPage(res, movie, isError = false) {
  renderFormPage(res, movie, "edit", isError);
}

async function renderFormPage(res, movie, form, isError = false) {
  try {
    const directors = await Director.find({});
    const params = {
      directors: directors,
      movie: movie,
    };
    if (isError) {
      if (form === "edit") {
        params.errorMessage = "Error in updating Movie";
      } else {
        params.errorMessage = "Error creating Movie";
      }
    }
    if (isError) params.errorMessage = "Error in creating Movie";
    res.render(`movies/${form}`, params);
  } catch {
    res.redirect("/movies");
  }
}

function saveCover(movie, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    movie.coverPoster = new Buffer.from(cover.data, "base64");
    movie.coverPosterType = cover.type;
  }
}

module.exports = router;
