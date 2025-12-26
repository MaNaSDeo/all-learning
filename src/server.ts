import express, { type Request, type Response } from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
    res.send("Hello, TypeScript with Express!")
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

/**
 * ROUTE goals
 * 
 * AUTH - signin, signup, logout, get current user.
 * MOVIE - Getting all movies, adding a movie, deleting a movie, updating a movie.
 * USER - Getting all users, adding a user, deleting a user, updating a user.
 * WATCHLIST - Getting all watchlist, adding a watchlist, deleting a watchlist, updating a watchlist.
 */