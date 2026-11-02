import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { posterSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { formatDayMonth } from "../../Services/format";
import { titleKey, useLibraryKeys, useQuickWishlist } from "../../Hooks/useLibraryKeys";
import { Button } from "../UI/Button";
import { Skeleton } from "../UI/States";
import { Reveal } from "../UI/Reveal";

// Coming soon as a list of opening dates beside one poster: whichever film you point at, focus or
// tap becomes the poster, and opens its story under its name.
function ComingSoon({ items = [], loading }) {
  const films = items.filter((item) => item.posterPath).slice(0, 8);
  const [active, setActive] = useState(0);
  const keys = useLibraryKeys();
  const toggleWishlist = useQuickWishlist();
  const current = films[active];

  if (!loading && !films.length) return null;

  return (
    <section className="page section-gap" aria-labelledby="coming-title">
      <div className="grid gap-10 md:grid-cols-12 md:gap-6">
        <div className="md:sticky md:top-[14vh] md:col-span-5 md:self-start">
          <div className="relative mx-auto aspect-[2/3] w-[64%] overflow-hidden rounded-poster bg-surface shadow-poster md:w-[82%]">
            {loading || !current ? (
              <Skeleton className="h-full w-full rounded-none" />
            ) : (
              <AnimatePresence initial={false}>
                <motion.img
                  key={current.id}
                  src={tmdbImage(current.posterPath, "w500")}
                  srcSet={posterSrcSet(current.posterPath)}
                  sizes="(min-width: 768px) 30vw, 64vw"
                  alt={`${current.title} poster`}
                  width="500"
                  height="750"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <h2 id="coming-title" className="display text-h2 text-ink">Coming Soon</h2>
            <p className="mt-2 text-ui text-muted">Opening in cinemas over the next weeks. Wishlist one and it waits for you.</p>
          </Reveal>
          <ul className="mt-10">
            {loading && Array.from({ length: 6 }, (_, index) => <li key={index}><Skeleton className="mb-3 h-12 w-full" /></li>)}
            {films.map((film, index) => {
              const isActive = index === active;
              const wishlisted = keys.wishlist.has(titleKey(film));
              return (
                <li key={film.id}>
                  <button
                    type="button"
                    aria-expanded={isActive}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    className="flex min-h-[58px] w-full items-baseline justify-between gap-6 py-3 text-left"
                  >
                    <span className={`text-[clamp(1.25rem,1rem+0.6vw,1.5rem)] transition-colors ${isActive ? "text-ink" : "text-muted can-hover:hover:text-ink"}`}>
                      {film.title}
                    </span>
                    <span className={`num flex-none text-[15px] ${isActive ? "text-accent" : "text-muted"}`}>{formatDayMonth(film.releaseDate)}</span>
                  </button>
                  {isActive && (
                    <div className="pb-5">
                      <p className="line-clamp-3 max-w-[48ch] text-[15px] leading-relaxed text-muted">{film.overview || "No synopsis yet."}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant={wishlisted ? "primary" : "outline"} onClick={() => toggleWishlist(film, wishlisted)} aria-pressed={wishlisted}>
                          {wishlisted ? "On Your Wishlist" : "Add to Wishlist"}
                        </Button>
                        <Link to={titleHref(film)} className="inline-flex h-8 items-center rounded-full px-3.5 text-[13px] font-medium text-ink can-hover:hover:bg-white/[0.06]">
                          Details
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ComingSoon;
