const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Get Movies API-1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT * FROM movie ORDER BY movie_id;
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

//Add movie API-2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
        INSERT INTO 
          movie (director_id, movie_name, lead_actor)
        VALUES (
            '${directorId}',
            '${movieName}',
            '${leadActor}'
        );`;
  const dbResponse = await db.run(addMovieQuery);
  const { movieId } = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//Get Movie API-3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
        *
    FROM
        movie
    WHERE
        movie_id = ${movieId};`;
  const movieArray = await db.get(getMovieQuery);
  response.send(movieArray);
});

//Update API-4
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
        UPDATE 
          movie 
        SET 
          director_id='${directorId}', 
          movie_name='${movieName}', 
          lead_actor='${leadActor}' 
        WHERE 
          movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete movie API-5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get Directors API-6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT * FROM director ORDER BY director_id;
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

//Get Specific director Movies API-7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `
    SELECT * FROM movie WHERE director_id = ${directorId};`;
  const directorMovies = await db.all(getDirectorMovies);
  response.send(directorMovies);
});

export default app;
