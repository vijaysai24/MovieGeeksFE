import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Heart, Info, Play } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { backdropSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { genreNames, useGenres } from "../../Hooks/useCatalogReference";
import { titleKey, useLibraryKeys, useQuickWishlist } from "../../Hooks/useLibraryKeys";
import { useRegion } from "../../Hooks/useRegion";
import { Button, LinkButton } from "../UI/Button";
import { Dialog } from "../UI/Dialog";
import { Skeleton } from "../UI/States";
import { RegionSelect } from "../Movie/RegionSelect";

const HOLD_MS = 8000;

// The title is set like an opening credit: as large as fits the width, on one line when short
// and two when long, never more.
const titleStyle = (title) => {
  const length = title.length;
  const perLine = length > 18 ? Math.ceil(length / 2) + 1 : length;
  return { fontSize: `clamp(2.75rem, calc((100vw - 64px) / ${(perLine * 0.47).toFixed(2)}), 8.5rem)` };
};

function TrailerButton({ item }) {
  const { region } = useRegion();
  const [open, setOpen] = useState(false);
  const { data: details } = useQuery({
    queryKey: ["catalog", "title", item.mediaType, item.id, region],
    queryFn: () => catalogApi.details(item.mediaType, item.id, region),
    staleTime: 10 * 60 * 1000,
  });
  const trailer = details?.trailer;
  if (!trailer) return null;

  return (
    <>
      <Button variant="accent" size="lg" className="max-sm:h-11 max-sm:px-4 max-sm:text-[15px]" onClick={() => setOpen(true)}>
        <Play size={18} fill="currentColor" aria-hidden="true" />
        Watch Trailer
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={trailer.name} size="lg" bare>
        <div className="aspect-video w-full bg-black">
          {open && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
              title={trailer.name}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              className="h-full w-full"
            />
          )}
        </div>
      </Dialog>
    </>
  );
}

function Hero({ spotlight = [], loading }) {
  const reduce = useReducedMotion();
  const { data: genres = [] } = useGenres();
  const keys = useLibraryKeys();
  const toggleWishlist = useQuickWishlist();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef(null);
  // Only titles shown after the first one animate in.
  const cycled = useRef(false);
  useEffect(() => {
    if (index > 0) cycled.current = true;
  }, [index]);

  // The signature move: the title settles a little as the first screen leaves.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);

  useEffect(() => {
    if (reduce || paused || spotlight.length < 2) return undefined;
    let timer = setInterval(() => setIndex((current) => (current + 1) % spotlight.length), HOLD_MS);
    const onVisibility = () => {
      clearInterval(timer);
      if (!document.hidden) timer = setInterval(() => setIndex((current) => (current + 1) % spotlight.length), HOLD_MS);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [spotlight.length, reduce, paused]);

  if (loading || !spotlight.length) {
    return (
      <section aria-busy="true" className="pb-8">
        <Skeleton className="h-[52svh] w-full rounded-none md:h-[60svh]" />
        <div className="page mt-8"><Skeleton className="h-28 w-3/4" /></div>
      </section>
    );
  }

  const current = spotlight[index];
  const wishlisted = keys.wishlist.has(titleKey(current));
  const meta = [
    current.mediaType === "tv" ? "Series" : "Film",
    current.year,
    genreNames(current.genreIds, genres).slice(0, 2).join(", "),
  ].filter(Boolean);

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Featured this week"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* The still: full-bleed, darkening into the room at its lower edge. */}
      <div className="relative h-[50svh] overflow-hidden bg-surface md:h-[56svh] md:min-h-[420px]">
        <AnimatePresence initial={false}>
          <motion.img
            key={current.id}
            src={tmdbImage(current.backdropPath, "w1280")}
            srcSet={backdropSrcSet(current.backdropPath)}
            sizes="100vw"
            alt={`Still from ${current.title}`}
            width="1920"
            height="1080"
            fetchpriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[50%_30%]"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.2 }, scale: { duration: 9, ease: "linear" } }}
          />
        </AnimatePresence>
        <div className="scrim-bottom absolute inset-0" aria-hidden="true" />

        {spotlight.length > 1 && (
          <div className="page absolute inset-x-0 bottom-4 flex justify-end">
            <div role="tablist" aria-label="Choose a featured title" className="flex gap-2">
              {spotlight.map((item, at) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={at === index}
                  aria-label={item.title}
                  onClick={() => setIndex(at)}
                  className={`relative hidden h-12 w-20 overflow-hidden rounded-[6px] border-2 transition-[opacity,border-color] md:block ${
                    at === index ? "border-ink opacity-100" : "border-transparent opacity-55 can-hover:hover:opacity-90"
                  }`}
                >
                  <img src={tmdbImage(item.backdropPath, "w300")} alt="" width="80" height="48" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
              <span className="flex gap-1.5 md:hidden" aria-hidden="true">
                {spotlight.map((item, at) => (
                  <span key={item.id} className={`h-1.5 rounded-full transition-[width,background-color] ${at === index ? "w-5 bg-ink" : "w-1.5 bg-white/40"}`} />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Under the picture, the title like an opening credit; under the title, what it is and
          what to do. The first title shown never waits on an animation. */}
      <div className="page relative -mt-4 md:-mt-10">
        <Link to={titleHref(current)} className="block">
          <motion.h1
            key={current.id}
            style={{ ...titleStyle(current.title), scale: reduce ? 1 : titleScale, transformOrigin: "left bottom" }}
            initial={reduce || !cycled.current ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="display text-ink [line-height:0.88]"
          >
            {current.title}
          </motion.h1>
        </Link>
      </div>

      <div className="page mt-6 grid gap-6 md:mt-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="num text-ui text-muted">
            Trending this week on <span translate="no">Cinefile</span> · {meta.join(" · ")}
            {current.rating ? <> · <span className="text-ink">TMDB {current.rating.toFixed(1)}</span></> : null}
          </p>
          <p className="mt-2 line-clamp-2 max-w-[62ch] text-read text-ink">{current.overview}</p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 md:col-span-5 md:justify-end">
          <TrailerButton key={`${current.mediaType}:${current.id}`} item={current} />
          <LinkButton to={titleHref(current)} variant="secondary" size="lg" className="max-sm:h-11 max-sm:px-4 max-sm:text-[15px]">
            <Info size={18} aria-hidden="true" />
            More Info
          </LinkButton>
          <button
            type="button"
            onClick={() => toggleWishlist(current, wishlisted)}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? `Remove ${current.title} from wishlist` : `Add ${current.title} to wishlist`}
            className={`inline-flex h-12 w-12 flex-none items-center justify-center rounded-full transition-[background-color,transform] active:scale-90 max-sm:h-11 max-sm:w-11 ${
              wishlisted ? "bg-accent text-accent-ink" : "bg-raised text-ink can-hover:hover:bg-nested"
            }`}
          >
            <Heart size={18} fill={wishlisted ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="page mt-8 flex flex-wrap items-center justify-between gap-3 text-ui text-muted">
        <RegionSelect />
        <span className="num">{index + 1} of {spotlight.length} featured</span>
      </div>
    </section>
  );
}

export default Hero;
