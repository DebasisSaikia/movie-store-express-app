const mongoose = require("mongoose");
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
    type: Buffer,
    required: true,
  },
  coverPosterType: {
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
  if (this.coverPoster != null && this.coverPosterType != null) {
    return `data:${
      this.coverPosterType
    };charset=utf-8;base64,${this.coverPoster.toString("base64")}`;
  }
});
module.exports = mongoose.model("Movie", movieSchema);

