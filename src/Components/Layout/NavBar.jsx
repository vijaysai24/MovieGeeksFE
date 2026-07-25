import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoviesMenu, setShowMoviesMenu] = useState(false);
  const [showMobileMovies, setShowMobileMovies] = useState(false);

  const navItems = [
    {
      name: "TV Shows",
      path: "/tvshows",
    },
    {
      name: "WatchList",
      path: "/watchlist",
    },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg">
   <nav className="rounded-b-md border border-slate-200 bg-white/90 shadow-lg">

        <div className="flex items-center justify-between px-6 py-2.5">

          {/* Logo */}

          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-black tracking-tight"
          >
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>

            <span>
              Movie
              <span className="text-amber-500">
                Geek
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}

          <ul className="hidden md:flex items-center gap-2 rounded-xl bg-slate-100 p-1.5">

            {/* Home */}

            <li>

              <NavLink
                to="/"
                className={({ isActive }) =>
                  `rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-white text-amber-500 shadow"
                      : "text-slate-600 hover:bg-white"
                  }`
                }
              >
                Home
              </NavLink>

            </li>

            {/* Movies Dropdown */}

            <li
              className="relative"
              onMouseEnter={() => setShowMoviesMenu(true)}
              onMouseLeave={() => setShowMoviesMenu(false)}
            >

              <button
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  showMoviesMenu
                    ? "bg-white shadow text-amber-500"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                Movies

                <svg
                  className={`h-4 w-4 transition-transform ${
                    showMoviesMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showMoviesMenu && (

                <div className="absolute left-0 top-full mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                  <NavLink
                    to="/movies/theatrical"
                    className="flex gap-4 p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl">
                      🎬
                    </div>

                    <div>

                      <h3 className="font-bold">
                        Theatrical Movies
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Discover the latest cinema releases and
                        box office hits.
                      </p>

                    </div>

                  </NavLink>

                  <div className="border-t"></div>

                  <NavLink
                    to="/movies/ott"
                    className="flex gap-4 p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                      📺
                    </div>

                    <div>

                      <h3 className="font-bold">
                        OTT Movies
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Netflix, Prime Video, Disney+, Apple TV
                        and more.
                      </p>

                    </div>

                  </NavLink>

                </div>

              )}

            </li>

            {/* Remaining Nav Items */}

            {navItems.map((item) => (

              <li key={item.path}>

                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-white text-amber-500 shadow"
                        : "text-slate-600 hover:bg-white"
                    }`
                  }
                >
                  {item.name}
                </NavLink>

              </li>

            ))}

          </ul>

          {/* Desktop Profile */}

          <NavLink
            to="/profile"
            className="hidden md:flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-2 transition hover:bg-slate-200"
          >

            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 font-bold text-white">
              V
            </div>

            <div>

              <p className="text-sm font-semibold">
                Vijay
              </p>


            </div>

          </NavLink>

          {/* Mobile Button */}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl p-2 transition hover:bg-slate-100 md:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

        </div>

                {/* Mobile Menu */}

       {isOpen && (
  <div className="md:hidden border-t border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur-2xl transition-all">
    <div className="p-4 space-y-3">
      {/* Outer Glass Container Card */}
      <div className="overflow-hidden rounded-2xl border border-[#222222] bg-[#111111]/80 divide-y divide-[#1f1f1f]">
        
        {/* Home */}
        <NavLink
          to="/"
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-5 py-3.5 text-sm transition-colors ${
              isActive
                ? "bg-[#1f1f1f] text-amber-400 font-bold border-l-2 border-amber-500"
                : "text-[#aaa] hover:text-white hover:bg-[#161616]"
            }`
          }
        >
          <span className="text-base text-amber-500">🏠</span>
          <span>Home</span>
        </NavLink>

        {/* Movies Accordion Section */}
        <div>
          <button
            onClick={() => setShowMobileMovies(!showMobileMovies)}
            className="flex w-full items-center justify-between px-5 py-3.5 text-sm text-[#aaa] hover:text-white hover:bg-[#161616] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-base text-amber-500">🎬</span>
              <span className="font-medium text-white">Movies</span>
            </div>
            <svg
              className={`h-4 w-4 text-[#777] transition-transform duration-300 ${
                showMobileMovies ? "rotate-180 text-amber-500" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Expanded Movies Sub-menu */}
          {showMobileMovies && (
            <div className="bg-[#0b0b0b] divide-y divide-[#181818] border-t border-[#1f1f1f]">
              <NavLink
                to="/movies/theatrical"
                onClick={() => {
                  setIsOpen(false);
                  setShowMobileMovies(false);
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-8 py-3.5 transition-colors ${
                    isActive
                      ? "bg-[#161616] text-amber-400 font-bold"
                      : "hover:bg-[#141414]"
                  }`
                }
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                  🎬
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Theatrical Movies
                  </h4>
                  <p className="text-[11px] text-[#666] mt-0.5">
                    Latest Cinema Releases
                  </p>
                </div>
              </NavLink>

              <NavLink
                to="/movies/ott"
                onClick={() => {
                  setIsOpen(false);
                  setShowMobileMovies(false);
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-8 py-3.5 transition-colors ${
                    isActive
                      ? "bg-[#161616] text-amber-400 font-bold"
                      : "hover:bg-[#141414]"
                  }`
                }
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                  📺
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    OTT Movies
                  </h4>
                  <p className="text-[11px] text-[#666] mt-0.5">
                    Netflix • Prime • Disney+
                  </p>
                </div>
              </NavLink>
            </div>
          )}
        </div>

        {/* Dynamic Nav Items */}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-5 py-3.5 text-sm transition-colors ${
                isActive
                  ? "bg-[#1f1f1f] text-amber-400 font-bold border-l-2 border-amber-500"
                  : "text-[#aaa] hover:text-white hover:bg-[#161616]"
              }`
            }
          >
            <span>{item.name}</span>
          </NavLink>
        ))}

        {/* Profile Card Footer */}
        <NavLink
          to="/profile"
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-5 py-3.5 transition-colors ${
              isActive
                ? "bg-[#1a1a1a]"
                : "hover:bg-[#161616]"
            }`
          }
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 font-black text-black text-sm shadow-lg shadow-amber-500/20">
            V
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Vijay</h4>
            <p className="text-[11px] text-amber-500/80 font-medium mt-0.5">
              View Profile & Watchlist
            </p>
          </div>
        </NavLink>
      </div>
    </div>
  </div>
)}
      </nav>
    </header>
  );
}

export default NavBar;