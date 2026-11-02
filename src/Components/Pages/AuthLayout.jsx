import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Dna, PartyPopper } from "lucide-react";
import { catalogApi } from "../../Services/catalogService";
import { backdropSrcSet, tmdbImage, titleHref } from "../../Services/images";

const PROMISES = [
  { icon: BookOpen, title: "A diary that remembers", body: "Log, rate and review everything you watch." },
  { icon: Dna, title: "Your film DNA", body: "See the taste your ratings reveal, and who shares it." },
  { icon: PartyPopper, title: "Lists and watch parties", body: "Gather films around an idea, or vote on tonight’s pick." },
];

// Sign-in and sign-up sit on a still from this week's most-watched title, dimmed so the form leads.
export function AuthLayout({ title, intro, children }) {
  const { data } = useQuery({
    queryKey: ["catalog", "list", "trending", "all"],
    queryFn: () => catalogApi.list("trending", { mediaType: "all" }),
    staleTime: 30 * 60 * 1000,
  });
  const still = data?.items.find((item) => item.backdropPath);

  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-surface">
      {still && (
        <img
          src={tmdbImage(still.backdropPath, "w1280")}
          srcSet={backdropSrcSet(still.backdropPath)}
          sizes="100vw"
          alt=""
          width="1920"
          height="1080"
          fetchpriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-black/35" aria-hidden="true" />
      <div className="scrim-left absolute inset-0 -z-10" aria-hidden="true" />
      <div className="scrim-bottom absolute inset-0 -z-10" aria-hidden="true" />

      <div className="page grid min-h-svh items-center gap-12 pb-16 pt-24 md:pt-28 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-20">
        <div className="hidden self-end lg:block">
          <p className="display max-w-[14ch] text-[clamp(3rem,2rem+3vw,5rem)] leading-[0.98] text-ink">A diary for everything you watch.</p>
          <ul className="mt-10 grid max-w-2xl grid-cols-3 gap-6">
            {PROMISES.map(({ icon: Icon, title: heading, body }) => (
              <li key={heading}>
                <Icon size={20} className="text-accent" aria-hidden="true" />
                <p className="mt-3 text-[15px] font-medium text-ink">{heading}</p>
                <p className="mt-1 text-[14px] text-muted">{body}</p>
              </li>
            ))}
          </ul>
          {still && (
            <p className="mt-12 text-[13px] text-faint">
              Still from <Link to={titleHref(still)} className="text-muted can-hover:hover:text-ink">{still.title}</Link>{still.year ? `, ${still.year}` : ""}
            </p>
          )}
        </div>

        <div className="mx-auto w-full max-w-[440px] rounded-panel bg-surface p-7 shadow-float md:p-9">
          <h1 className="display text-[clamp(2.25rem,1.8rem+1.6vw,3rem)] leading-[1.02] text-ink">{title}</h1>
          {intro && <p className="mt-3 text-[15px] text-muted">{intro}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
