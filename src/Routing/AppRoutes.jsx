import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import MainDashboard from "../Components/Layout/MainDashboard";
import { useAuth } from "../Context/AuthContext";

// Each page is its own chunk, so the first visit only downloads the page it opens.
const Home = lazy(() => import("../Components/Pages/Home"));
const Discover = lazy(() => import("../Components/Pages/Discover"));
const TitleDetails = lazy(() => import("../Components/Pages/MovieDetails"));
const Person = lazy(() => import("../Components/Pages/Person"));
const Search = lazy(() => import("../Components/Pages/Search"));
const Login = lazy(() => import("../Components/Pages/Login"));
const Register = lazy(() => import("../Components/Pages/Register"));
const Profile = lazy(() => import("../Components/Pages/Profile"));
const WatchList = lazy(() => import("../Components/Pages/WatchList"));
const Diary = lazy(() => import("../Components/Pages/Diary"));
const Feed = lazy(() => import("../Components/Pages/Feed"));
const Notifications = lazy(() => import("../Components/Pages/Notifications"));
const Community = lazy(() => import("../Components/Pages/Community"));
const Settings = lazy(() => import("../Components/Pages/Settings"));
const Calendar = lazy(() => import("../Components/Pages/Calendar"));
const Compare = lazy(() => import("../Components/Pages/Compare"));
const Moderation = lazy(() => import("../Components/Pages/Moderation"));
const NotFound = lazy(() => import("../Components/Pages/NotFound"));

function PageFallback() {
  return <div className="min-h-[70vh]" aria-busy="true" />;
}

// Members-only pages wait for the session check, then send guests to sign in and back again.
function RequireMember({ children, staff = false }) {
  const { status, isStaff } = useAuth();
  const location = useLocation();

  if (status === "loading") return <PageFallback />;
  if (status === "guest") return <Navigate to="/login" replace state={{ from: location }} />;
  if (staff && !isStaff) return <Navigate to="/" replace />;
  return children;
}

function OwnProfile() {
  const { user, status } = useAuth();
  if (status === "loading") return <PageFallback />;
  return <Navigate to={user ? `/u/${user.username}` : "/login"} replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<MainDashboard />}>
          <Route index element={<Home />} />
          <Route path="discover" element={<Discover />} />
          <Route path="movies/theatrical" element={<Discover preset="theatres" />} />
          <Route path="movies/ott" element={<Discover preset="streaming" />} />
          <Route path="tvshows" element={<Discover preset="series" />} />
          <Route path="search" element={<Search />} />
          <Route path="movie/:id" element={<TitleDetails mediaType="movie" />} />
          <Route path="tv/:id" element={<TitleDetails mediaType="tv" />} />
          <Route path="person/:id" element={<Person />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="u/:username" element={<Profile />} />
          <Route path="profile" element={<OwnProfile />} />
          <Route path="watchlist" element={<WatchList />} />
          <Route path="community" element={<Community />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="compare" element={<Compare />} />
          <Route path="diary" element={<RequireMember><Diary /></RequireMember>} />
          <Route path="feed" element={<RequireMember><Feed /></RequireMember>} />
          <Route path="notifications" element={<RequireMember><Notifications /></RequireMember>} />
          <Route path="settings" element={<RequireMember><Settings /></RequireMember>} />
          <Route path="moderation" element={<RequireMember staff><Moderation /></RequireMember>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
