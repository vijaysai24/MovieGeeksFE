import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { backdropSrcSet, posterSrcSet, tmdbImage } from "../../Services/images";

// Sections of the reading column name the picture that suits them (data-stage); the fixed half
// crossfades to it as each section reaches the middle of the screen.
export function useStageSection(ready, defaultStage = "backdrop") {
  const [stage, setStage] = useState(defaultStage);

  useEffect(() => {
    if (!ready) return undefined;
    const sections = [...document.querySelectorAll("[data-stage]")];
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setStage(visible[visible.length - 1].target.dataset.stage);
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ready]);

  return stage;
}

export function TitleStage({ images, stage, title }) {
  const reduce = useReducedMotion();
  const image = images[stage]?.path ? images[stage] : images.backdrop?.path ? images.backdrop : images.poster;

  if (!image?.path) {
    return <div className="flex h-full items-center justify-center bg-raised p-10"><span className="display text-center text-5xl text-muted">{title}</span></div>;
  }

  const isBackdrop = image.kind === "backdrop";

  return (
    <div className="relative h-full overflow-hidden bg-raised">
      <AnimatePresence initial={false}>
        <motion.img
          key={image.path}
          src={tmdbImage(image.path, isBackdrop ? "w1280" : "w780")}
          srcSet={isBackdrop ? backdropSrcSet(image.path) : posterSrcSet(image.path)}
          sizes="(min-width: 768px) 45vw, 100vw"
          alt={image.alt}
          width={isBackdrop ? 1280 : 780}
          height={isBackdrop ? 720 : 1170}
          fetchpriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: image.kind === "person" ? "50% 20%" : "50% 35%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: reduce ? 1 : [1, 1.05] }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2, ease: "easeInOut" }, scale: { duration: 20, ease: "linear" } }}
        />
      </AnimatePresence>
    </div>
  );
}
