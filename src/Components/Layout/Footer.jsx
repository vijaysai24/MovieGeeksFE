import { Link } from "react-router-dom";

// A single quiet line. TMDB and JustWatch are credited as their terms require.
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mx-auto max-w-[1440px] px-4 pb-24 pt-[20svh] text-sm md:px-6 md:pb-8 md:pt-[24svh] lg:px-8">
      <div className="grid gap-2 text-faint md:grid-cols-[1fr_auto_1fr] md:items-baseline md:gap-6">
        <p>Movie Geeks · a diary for everything you watch</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1">
          <Link to="/discover" className="text-ink hover:text-accent">Discover</Link>
          <Link to="/calendar" className="text-ink hover:text-accent">Release calendar</Link>
          <Link to="/community" className="text-ink hover:text-accent">Community</Link>
          <Link to="/compare" className="text-ink hover:text-accent">Compare</Link>
        </nav>
        <p className="md:text-right">&copy; {currentYear} Movie Geeks</p>
      </div>
      <p className="mt-6 max-w-[60ch] text-[13px] leading-relaxed text-faint">
        Film and series data and images from{" "}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="text-muted underline-offset-4 hover:underline">TMDB</a>
        ; this product uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability by{" "}
        <a href="https://www.justwatch.com/" target="_blank" rel="noreferrer" className="text-muted underline-offset-4 hover:underline">JustWatch</a>.
      </p>
    </footer>
  );
}

export default Footer;
