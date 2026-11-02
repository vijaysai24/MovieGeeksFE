import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { backdropSrcSet, posterSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { SectionHead } from "../UI/Section";

// Each exhibit: which picture, its shape, where it sits on the 12-column grid and how far it
// drops below its partner. Two arrangements, the second mirroring the first.
const LAYOUT = [
  { kind: "poster", ratio: "2/3", cols: "md:col-start-1 md:col-span-4", drop: "" },
  { kind: "still", ratio: "5/4", cols: "md:col-start-7 md:col-span-6", drop: "md:mt-[28vh]" },
  { kind: "still", ratio: "3/2", cols: "md:col-start-6 md:col-span-6", drop: "md:mt-[18vh]" },
  { kind: "poster", ratio: "4/5", cols: "md:col-start-2 md:col-span-3 md:row-start-2", drop: "md:mt-[44vh]" },
  { kind: "poster", ratio: "2/3", cols: "md:col-start-9 md:col-span-4", drop: "md:mt-[18vh]" },
  { kind: "still", ratio: "5/4", cols: "md:col-start-1 md:col-span-6", drop: "md:mt-[40vh]" },
];

// On a phone the exhibits alternate width and side in a single column.
const PHONE = ["w-[70%] mr-auto", "w-[84%] ml-auto", "w-[56%] mr-auto", "w-full", "w-[70%] ml-auto", "w-[84%] mr-auto"];

function Exhibit({ item, slot, index }) {
  const reduce = useReducedMotion();
  const frameRef = useRef(null);
  // Watch the uncropped frame: Chrome treats an element hidden by its own clip-path as having no
  // area, so observing the wiped picture itself would never fire.
  const inView = useInView(frameRef, { once: true, amount: 0.2 });
  const isPoster = slot.kind === "poster";
  const path = isPoster ? item.posterPath : item.backdropPath;

  return (
    <figure ref={frameRef} className={`${PHONE[index]} ${slot.cols} ${slot.drop}`}>
      <Link to={titleHref(item)} className="group block overflow-hidden rounded-poster">
        <motion.div
          initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
          animate={reduce || inView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={tmdbImage(path, isPoster ? "w500" : "w1280")}
            srcSet={isPoster ? posterSrcSet(path) : backdropSrcSet(path)}
            sizes={isPoster ? "(min-width: 768px) 33vw, 70vw" : "(min-width: 768px) 50vw, 90vw"}
            alt={`${item.title}${isPoster ? " poster" : ", still"}`}
            width="800"
            height="600"
            decoding="async"
            style={{ aspectRatio: slot.ratio }}
            className="w-full bg-surface object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] can-hover:group-hover:scale-[1.03]"
          />
        </motion.div>
      </Link>
      <figcaption className="num mt-3 text-[14px] text-muted">
        <Link to={titleHref(item)} className="text-ink can-hover:hover:text-accent">{item.title}</Link>
        {item.year && `, ${item.year}`}
        {item.rating ? ` · TMDB ${item.rating.toFixed(1)}` : ""}
      </figcaption>
    </figure>
  );
}

function HiddenGems({ items = [] }) {
  const usable = [];
  const posters = items.filter((item) => item.posterPath);
  const stills = items.filter((item) => item.backdropPath);
  const used = new Set();
  for (const slot of LAYOUT) {
    const pool = slot.kind === "poster" ? posters : stills;
    const item = pool.find((candidate) => !used.has(candidate.id));
    if (!item) break;
    used.add(item.id);
    usable.push({ item, slot });
  }
  if (usable.length < 4) return null;

  return (
    <section className="page section-gap" aria-labelledby="gems-title">
      <SectionHead
        id="gems-title"
        title="Hidden Gems"
        subtitle="Loved by the few who found them. Scores above 7.4, fewer than 3,000 votes."
        href="/discover?list=hidden_gems"
      />
      <div className="mt-10 flex flex-col gap-16 md:grid md:grid-flow-row-dense md:grid-cols-12 md:gap-x-6 md:gap-y-0">
        {usable.map(({ item, slot }, index) => <Exhibit key={item.id} item={item} slot={slot} index={index} />)}
      </div>
    </section>
  );
}

export default HiddenGems;
