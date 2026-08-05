import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoviesMenu, setShowMoviesMenu] = useState(false);
  const [showMobileMovies, setShowMobileMovies] = useState(false);

  const navRef = useRef(null);
  const location = useLocation();

  const navItems = [
    { name: "TV Shows", path: "/tvshows" },
    { name: "WatchList", path: "/watchlist" },
  ];

  // Close menus when location/route changes
  useEffect(() => {
    setIsOpen(false);
    setShowMoviesMenu(false);
    setShowMobileMovies(false);
  }, [location.pathname]);

  // Click outside handler to dismiss dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setShowMoviesMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMoviesActive = location.pathname.startsWith("/movies");

  const desktopLinkClasses = ({ isActive }) =>
    `group relative flex items-center px-4 py-2 text-[13px] font-semibold tracking-wide transition-colors duration-200 ${
      isActive ? "text-amber-400" : "text-zinc-400 hover:text-zinc-100"
    }`;

  const activeUnderline = (isActive) => (
    <span
      className={`pointer-events-none absolute -bottom-[1px] left-4 right-4 h-[2px] rounded-full bg-amber-400 transition-all duration-300 origin-left ${
        isActive
          ? "scale-x-100 opacity-100"
          : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-40"
      }`}
    />
  );

  return (
    <header className="sticky top-0 z-50">
      <nav
        ref={navRef}
        className="relative border-b border-zinc-800/80 bg-zinc-950/90 shadow-2xl backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
            </span>
            <span className="text-xl font-black tracking-tight text-zinc-100">
              Movie<span className="text-amber-400">Geek</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-1 md:flex">
            <li>
              <NavLink to="/" className={desktopLinkClasses}>
                {({ isActive }) => (
                  <>
                    Home
                    {activeUnderline(isActive)}
                  </>
                )}
              </NavLink>
            </li>

            {/* Movies Dropdown (Click triggered) */}
            <li className="relative">
              <button
                type="button"
                onClick={() => setShowMoviesMenu((prev) => !prev)}
                className={`group relative flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold tracking-wide transition-colors duration-200 ${
                  showMoviesMenu || isMoviesActive
                    ? "text-amber-400"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                Movies
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
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
                <span
                  className={`pointer-events-none absolute -bottom-[1px] left-4 right-4 h-[2px] rounded-full bg-amber-400 transition-all duration-300 origin-left ${
                    showMoviesMenu || isMoviesActive
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0"
                  }`}
                />
              </button>

              {showMoviesMenu && (
                <div className="absolute left-1/2 top-full mt-3 w-80 -translate-x-1/2 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/95 p-1.5 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all duration-200">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />

                  <div className="relative flex flex-col gap-1">
                    <NavLink
                      to="/movies/theatrical"
                      onClick={() => setShowMoviesMenu(false)}
                      className={({ isActive }) =>
                        `group relative flex items-start gap-3.5 rounded-xl p-3 transition-all duration-200 ${
                          isActive
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            : "border border-transparent text-zinc-300 hover:bg-zinc-900/80 hover:text-white"
                        }`
                      }
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-lg ring-1 ring-amber-500/10 transition-transform duration-200 group-hover:scale-105">
                        🎬
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold tracking-wide text-zinc-100 group-hover:text-amber-400">
                            Theatrical Movies
                          </h3>
                          <span className="text-[10px] font-semibold tracking-wider text-amber-400/80 uppercase opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            Cinema
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                          Latest releases, trending blockbusters, and theatrical schedules.
                        </p>
                      </div>
                    </NavLink>

                    <div className="mx-2 my-0.5 border-t border-zinc-800/60" />

                    <NavLink
                      to="/movies/ott"
                      onClick={() => setShowMoviesMenu(false)}
                      className={({ isActive }) =>
                        `group relative flex items-start gap-3.5 rounded-xl p-3 transition-all duration-200 ${
                          isActive
                            ? "bg-sky-500/10 border border-sky-500/20 text-sky-400"
                            : "border border-transparent text-zinc-300 hover:bg-zinc-900/80 hover:text-white"
                        }`
                      }
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-lg ring-1 ring-sky-500/10 transition-transform duration-200 group-hover:scale-105">
                        📺
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold tracking-wide text-zinc-100 group-hover:text-sky-400">
                            OTT Movies
                          </h3>
                          <span className="text-[10px] font-semibold tracking-wider text-sky-400/80 uppercase opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            Digital
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                          Streaming hits across Netflix, Prime, Disney+, Apple TV & more.
                        </p>
                      </div>
                    </NavLink>
                  </div>
                </div>
              )}
            </li>

            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} className={desktopLinkClasses}>
                  {({ isActive }) => (
                    <>
                      {item.name}
                      {activeUnderline(isActive)}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop Profile Button */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `hidden items-center gap-2.5 rounded-full border px-3.5 py-1.5 transition-all duration-200 md:flex ${
                isActive
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/80"
              }`
            }
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-zinc-950 shadow-md shadow-amber-400/20">
              V
            </div>
            <span className="text-[13px] font-semibold text-zinc-200">Vijay</span>
          </NavLink>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-2xl md:hidden">
            <div className="space-y-3 p-4">
              <div className="divide-y divide-zinc-800/60 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80">
                <NavLink
                  to="/"
                  end
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-5 py-3.5 text-sm transition-colors ${
                      isActive
                        ? "border-l-2 border-amber-400 bg-amber-500/10 font-bold text-amber-400"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                    }`
                  }
                >
                  <span className="text-base text-amber-400">🏠</span>
                  <span>Home</span>
                </NavLink>

                {/* Mobile Movies Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowMobileMovies(!showMobileMovies)}
                    className="flex w-full items-center justify-between px-5 py-3.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-100"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-base text-amber-400">🎬</span>
                      <span className="font-medium text-zinc-200">Movies</span>
                    </div>
                    <svg
                      className={`h-4 w-4 text-zinc-500 transition-transform duration-300 ${
                        showMobileMovies ? "rotate-180 text-amber-400" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showMobileMovies && (
                    <div className="divide-y divide-zinc-800/40 border-t border-zinc-800/60 bg-zinc-950/60">
                      <NavLink
                        to="/movies/theatrical"
                        onClick={() => {
                          setIsOpen(false);
                          setShowMobileMovies(false);
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-3.5 px-8 py-3.5 transition-colors ${
                            isActive ? "bg-amber-500/10 font-bold text-amber-400" : "hover:bg-zinc-900/50 text-zinc-300"
                          }`
                        }
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-sm">
                          🎬
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-100">Theatrical Movies</h4>
                          <p className="mt-0.5 text-[11px] text-zinc-400">Latest Cinema Releases</p>
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
                            isActive ? "bg-sky-500/10 font-bold text-sky-400" : "hover:bg-zinc-900/50 text-zinc-300"
                          }`
                        }
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sm">
                          📺
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-100">OTT Movies</h4>
                          <p className="mt-0.5 text-[11px] text-zinc-400">Netflix • Prime • Disney+</p>
                        </div>
                      </NavLink>
                    </div>
                  )}
                </div>

                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-5 py-3.5 text-sm transition-colors ${
                        isActive
                          ? "border-l-2 border-amber-400 bg-amber-500/10 font-bold text-amber-400"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                      }`
                    }
                  >
                    <span>{item.name}</span>
                  </NavLink>
                ))}

                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-5 py-3.5 transition-colors ${
                      isActive ? "bg-zinc-800/80" : "hover:bg-zinc-800/40"
                    }`
                  }
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-zinc-950 shadow-md shadow-amber-400/20">
                    V
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Vijay</h4>
                    <p className="mt-0.5 text-[11px] font-medium text-amber-400">View Profile & Watchlist</p>
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