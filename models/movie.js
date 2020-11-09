const mongoose = require("mongoose");
const path = require("path");
const coverPosterBasePath = "uploads/coverPosters";

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  ratingCount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  coverPoster: {
    type: String,
    required: true,
  },
  director: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Director",
  },
});

movieSchema.virtual("coverPosterPath").get(function () {
  if (this.coverPoster != null) {
    return path.join("/", coverPosterBasePath, this.coverPoster);
  }
});
module.exports = mongoose.model("Movie", movieSchema);
module.exports.coverPosterBasePath = coverPosterBasePath;
