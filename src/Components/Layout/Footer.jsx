import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      ["Discover", "/discover"],
      ["In Cinemas", "/movies/theatrical"],
      ["Streaming", "/movies/ott"],
      ["Series", "/tvshows"],
      ["Release Calendar", "/calendar"],
    ],
  },
  {
    title: "Your Cinefile",
    member: true,
    links: [
      ["Library", "/watchlist"],
      ["Diary", "/diary"],
      ["Watch Parties", "/parties"],
      ["Settings", "/settings"],
    ],
  },
  {
    title: "Community",
    links: [
      ["Reviews and Members", "/community"],
      ["Lists", "/community?tab=lists"],
      ["Compare Two Films", "/compare"],
    ],
  },
];

// The close of every page: the one light band on the site, uncovered as the page slides away,
// with the name set across its full width.
function Footer() {
  const { isMember } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="sticky bottom-0 z-0 bg-light text-light-ink">
      <div className="page grid min-h-[78svh] grid-rows-[auto_1fr_auto] pb-24 pt-14 md:min-h-[92svh] md:pb-6 md:pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {COLUMNS.filter((column) => !column.member || isMember).map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-[15px] font-medium">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-[15px] text-light-muted transition-colors can-hover:hover:text-light-ink">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="col-span-2 md:col-span-1">
            <p className="text-[15px] font-medium">About the data</p>
            <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-light-muted">
              Film and series data and images from{" "}
              <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="underline underline-offset-4 can-hover:hover:text-light-ink">TMDB</a>.
              Cinefile uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability by{" "}
              <a href="https://www.justwatch.com/" target="_blank" rel="noreferrer" className="underline underline-offset-4 can-hover:hover:text-light-ink">JustWatch</a>.
            </p>
          </div>
        </div>

        <div aria-hidden="true" />

        <div>
          <svg viewBox="0 0 1000 232" className="block w-full" role="img" aria-label="Cinefile">
            <text x="-6" y="196" textLength="1012" lengthAdjust="spacingAndGlyphs" fill="currentColor" style={{ fontFamily: "Boska, Georgia, serif", fontSize: 262, fontWeight: 500, letterSpacing: "-0.02em" }}>
              Cinefile
            </text>
          </svg>
          <p className="mt-4 flex flex-wrap justify-between gap-2 text-[13px] text-light-muted">
            <span>&copy; {year} <span translate="no">Cinefile</span>. A diary for everything you watch.</span>
            <span>Made for people who stay for the credits.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
