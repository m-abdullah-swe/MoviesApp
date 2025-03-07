require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const OMDB_API_KEY = process.env.OMDB_API_KEY;

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const movieSchema = new mongoose.Schema({
  title: String,
  poster: String,
  year: String,
  genre: String,
  plot: String,
  imdbRating: String,
  director: String,
  imdbID: String,
});
const Movie = mongoose.model("Movie", movieSchema);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  message: { error: "Too many requests, please try again later." },
});
app.use("/search", limiter);

app.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const cachedMovies = await Movie.find({ title: new RegExp(query, "i") });
    if (cachedMovies.length > 0) {
      return res.json(cachedMovies);
    }

    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(
      query
    )}&apikey=${OMDB_API_KEY}`;
    const response = await axios.get(url);

    if (response.data.Response === "False") {
      return res.status(404).json({ error: response.data.Error });
    }

    const movies = await Promise.all(
      response.data.Search.map(async (movie) => {
        const detailsUrl = `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${OMDB_API_KEY}`;
        const detailsResponse = await axios.get(detailsUrl);
        const movieDetails = detailsResponse.data;

        const newMovie = new Movie({
          title: movieDetails.Title,
          poster: movieDetails.Poster,
          year: movieDetails.Year,
          genre: movieDetails.Genre,
          plot: movieDetails.Plot,
          imdbRating: movieDetails.imdbRating,
          director: movieDetails.Director,
          imdbID: movieDetails.imdbID,
        });
        await newMovie.save();
        return newMovie;
      })
    );

    res.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
