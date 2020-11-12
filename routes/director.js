const express = require("express");
const router = express.Router();
const Director = require("../models/director");
const Movie = require("../models/movie");

// getting all
router.get("/", async (req, res) => {
  let searchResults = {};
  if (req.query.name != null && req.query.name !== "") {
    searchResults.name = new RegExp(req.query.name, "i");
  }
  try {
    const directors = await Director.find(searchResults);
    res.render("directors/index", {
      directors: directors,
      searchResults: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

// new routes for creator
router.get("/new", (req, res) => {
  res.render("directors/new", { director: new Director() });
});

// create new directors:
router.post("/", async (req, res) => {
  const director = new Director({
    name: req.body.name,
  });
  try {
    const newDirector = await director.save();
    res.redirect(`directors/${newDirector.id}`);
  } catch {
    res.render("directors/new", {
      director: director,
      errorMessage: "Error in creating director",
    });
  }
});

// get director
router.get("/:id", async (req, res) => {
  try {
    const director = await Director.findById(req.params.id);
    const movies = await Movie.find({ director: director.id }).limit(6).exec();
    res.render("directors/show", {
      director: director,
      moviesByDirector: movies,
    });
  } catch  {
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const director = await Director.findById(req.params.id);
    res.render("directors/edit", { director: director });
  } catch {
    res.redirect("/directors");
  }
});

router.put("/:id", async (req, res) => {
  let director;
  try {
    director = await Director.findById(req.params.id);
    director.name = req.body.name;
    await director.save();
    res.redirect(`/directors/${director.id}`);
  } catch {
    if (director == null) {
      res.redirect("/");
    } else {
      res.render("directors/edit", {
        director: director,
        errorMessage: "Error in updating director",
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
  let director;
  try {
    director = await Director.findById(req.params.id);
    await director.remove();
    res.redirect("/directors");
  } catch {
    if (director == null) {
      res.redirect("/");
    } else {
      res.redirect(`/directors/${director.id}`);
    }
  }
});

module.exports = router;
