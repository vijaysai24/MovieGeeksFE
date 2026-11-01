import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../Context/AuthContext";
import { libraryApi } from "../../Services/userService";
import { backdropSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { regionName } from "../../Hooks/useRegion";
import { LinkButton } from "../UI/Button";
import { Skeleton } from "../UI/States";
import { RegionSelect } from "../Movie/RegionSelect";

const HOLD_MS = 6000;

// The signature move: the week's most-watched stills change slowly, like light in a cinema.
function Spotlight({ items }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || items.length < 2) return undefined;
    let timer = null;
    const start = () => {
      timer = setInterval(() => setIndex((current) => (current + 1) % items.length), HOLD_MS);
    };
    const onVisibility = () => {
      clearInterval(timer);
      if (!document.hidden) start();
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [items.length, reduce]);

  const current = items[index];

  return (
    <div className="relative h-full overflow-hidden bg-raised">
      <AnimatePresence initial={false}>
        <motion.img
          key={current.id}
          src={tmdbImage(current.backdropPath, "w1280")}
          srcSet={backdropSrcSet(current.backdropPath)}
          sizes="(min-width: 768px) 50vw, 100vw"
          alt={`Still from ${current.title}`}
          width="1280"
          height="720"
          fetchpriority={index === 0 ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: reduce ? 1 : 1.07 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.6, ease: "easeInOut" }, scale: { duration: (HOLD_MS + 1600) / 1000, ease: "linear" } }}
        />
      </AnimatePresence>

      <Link
        to={titleHref(current)}
        className="absolute inset-x-0 bottom-0 flex h-14 items-center justify-between gap-4 bg-paper px-5 text-base transition-colors hover:text-accent"
      >
        <span className="truncate text-ink">
          {current.title} <span className="text-faint">{current.year}</span>
        </span>
        <span className="num flex-none text-muted">
          {current.mediaType === "tv" ? "Series" : "Film"} · TMDB {current.rating?.toFixed(1) ?? "-"}
        </span>
      </Link>
    </div>
  );
}

function Hero({ spotlight = [], loading, region }) {
  const { user, isMember } = useAuth();
  const { data: counts } = useQuery({
    queryKey: ["me", "counts"],
    queryFn: libraryApi.counts,
    enabled: isMember,
  });

  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  const queued = counts ? counts.planToWatch + counts.wishlist : null;

  return (
    <section className="flex flex-col gap-3 p-3 md:grid md:h-[calc(100svh-64px)] md:min-h-[620px] md:grid-cols-2" aria-labelledby="hero-title">
      <div className="sticky top-14 h-[56svh] md:static md:order-2 md:h-auto">
        {loading || !spotlight.length ? <Skeleton className="h-full w-full rounded-none" /> : <Spotlight items={spotlight} />}
      </div>

      <div className="relative z-10 -mt-[10svh] flex flex-col bg-paper px-6 pb-8 pt-12 md:order-1 md:mt-0 md:px-10 md:pb-8 md:pt-8">
        <div className="mx-auto flex max-w-[34rem] flex-1 flex-col items-center text-center md:mt-[24%]">
          <h1 id="hero-title" className="display max-w-[18ch] text-[clamp(2.5rem,9vw,3.5rem)] text-accent md:text-[clamp(2.5rem,3.6vw,3.5rem)]">
            {isMember ? "What are you watching tonight?" : "Keep the films that made you"}
          </h1>
          <p className="mt-8 max-w-[40ch] text-[17px] leading-relaxed text-ink">
            {isMember
              ? queued === null
                ? `What's in cinemas and streaming in ${regionName(region)}, and what your friends thought of it.`
                : `${queued} ${queued === 1 ? "title is" : "titles are"} waiting on your watchlist, ${user.name.split(" ")[0]}. Here's what's showing in ${regionName(region)}.`
              : `Find what's in cinemas and streaming in ${regionName(region)}, then log, rate and review everything you watch.`}
          </p>
          <div className="mt-8">
            {isMember ? (
              <LinkButton to="/diary" variant="accent" size="lg">Open your diary</LinkButton>
            ) : (
              <LinkButton to="/register" variant="accent" size="lg">Start your film diary</LinkButton>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-base text-muted md:mt-0">
          <RegionSelect />
          <span className="hidden sm:inline">{today}</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
