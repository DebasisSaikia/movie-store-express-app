const express = require("express");
const router = express.Router();
const Director = require("../models/director");

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
    //  res.redirect(`authors/${newAuthor.id}`);
    res.redirect("directors");
  } catch {
    res.render("directors/new", {
      director: director,
      errorMessage: "Error creating author",
    });
  }
});

module.exports = router;
