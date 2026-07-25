import { Routes, Route } from "react-router-dom";
import MainDashboard from "../Components/Layout/MainDashboard";
import Home from "../Components/Pages/Home";
import MovieDetails from "../Components/Pages/MovieDetails";
import Profile from "../Components/Pages/Profile";
import TvShows from "../Components/Pages/TvShows";
import TheatricalMovies from "../Components/Pages/TheatricalMovies";
import OttMovies from "../Components/Pages/OttMovies";
import WatchList from "../Components/Pages/Watchlist";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainDashboard />}>
        <Route index element={<Home />} />
        <Route path="/movies/theatrical" element={<TheatricalMovies />} />
        <Route path="/movies/ott" element={<OttMovies />} />
        <Route path="tvshows" element={<TvShows />} />
        <Route path="profile" element={<Profile />} />
        <Route path="watchlist" element={<WatchList />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;