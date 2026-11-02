import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { LinkButton } from "../UI/Button";
import { Wordmark } from "./Wordmark";

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

// The close of every page, on the same dark ground as the rest: what to do next, where to go, and
// the name set large in a tone just off the ground, like the last card of the credits.
function Footer() {
  const { isMember } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden bg-surface text-ink">
      <div className="page pb-28 pt-16 md:pb-10 md:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div className="col-span-2 md:col-span-1">
            <Wordmark />
            <p className="mt-4 max-w-[30ch] text-ui text-muted">A diary for everything you watch, and the people who watch it with you.</p>
            {!isMember && (
              <div className="mt-6 flex flex-wrap gap-2">
                <LinkButton to="/register" variant="accent">Join Free</LinkButton>
                <LinkButton to="/login" variant="ghost">Sign In</LinkButton>
              </div>
            )}
          </div>

          {COLUMNS.filter((column) => !column.member || isMember).map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-ui font-semibold text-ink">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-ui text-muted transition-colors can-hover:hover:text-ink">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <svg viewBox="0 0 1000 232" className="mt-16 block w-full text-raised md:mt-24" aria-hidden="true">
          <text x="-6" y="196" textLength="1012" lengthAdjust="spacingAndGlyphs" fill="currentColor" style={{ fontFamily: "Boska, Georgia, serif", fontSize: 262, fontWeight: 500, letterSpacing: "-0.02em" }}>
            Cinefile
          </text>
        </svg>

        <div className="mt-8 grid gap-4 text-[14px] text-faint md:grid-cols-2 md:gap-10">
          <p>
            &copy; {year} <span translate="no">Cinefile</span>. Made for people who stay for the credits.
          </p>
          <p className="md:text-right">
            Film and series data and images from{" "}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="text-muted underline underline-offset-4 can-hover:hover:text-ink">TMDB</a>.
            {" "}<span translate="no">Cinefile</span> uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability by{" "}
            <a href="https://www.justwatch.com/" target="_blank" rel="noreferrer" className="text-muted underline underline-offset-4 can-hover:hover:text-ink">JustWatch</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
