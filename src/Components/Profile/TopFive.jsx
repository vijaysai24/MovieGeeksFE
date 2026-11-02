import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { titleHref } from "../../Services/images";
import { Poster } from "../Movie/PosterCard";
import { Button } from "../UI/Button";
import { SectionHead } from "../UI/Section";

// The five titles someone picked to stand for them, numbered large. Owners see the empty slots as
// invitations to fill.
export function TopFive({ profile, onEdit }) {
  const five = profile.topFive;
  const owner = profile.isSelf ? "Your" : `${profile.user.name.split(" ")[0]}'s`;
  const slots = profile.isSelf ? [...five, ...Array(Math.max(0, 5 - five.length)).fill(null)] : five;

  if (!slots.length) return null;

  return (
    <section aria-labelledby="five-title">
      <SectionHead
        id="five-title"
        title={`${owner} Five`}
        subtitle={profile.isSelf ? "The five films or series that say the most about you." : null}
      >
        {profile.isSelf && <Button variant="secondary" onClick={onEdit}>{five.length ? "Change Your Five" : "Choose Your Five"}</Button>}
      </SectionHead>

      <ol className="hide-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-5 md:gap-5 md:overflow-visible md:px-0">
        {slots.map((title, index) => (
          <li key={title ? `${title.mediaType}:${title.id}` : `empty-${index}`} className="w-[44vw] flex-none snap-start md:w-auto">
            {title ? (
              <Link to={titleHref(title)} className="group block">
                <span className="block overflow-hidden rounded-poster bg-raised transition-[transform,box-shadow] duration-300 can-hover:group-hover:-translate-y-1 can-hover:group-hover:shadow-lift">
                  <Poster path={title.posterPath} title={title.title} sizes="(min-width: 768px) 19vw, 44vw" className="transition-transform duration-500 can-hover:group-hover:scale-[1.04]" />
                </span>
                <span className="mt-3 flex items-baseline gap-3">
                  <span className="display num flex-none text-[2.75rem] leading-[0.8] text-accent md:text-[3.5rem]" aria-label={`Number ${index + 1}`}>{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-ui font-medium text-ink can-hover:group-hover:text-accent">{title.title}</span>
                    <span className="num block text-[13px] text-faint">{title.year || "TBA"}{title.mediaType === "tv" ? " · Series" : ""}</span>
                  </span>
                </span>
              </Link>
            ) : (
              <button type="button" onClick={onEdit} className="group block w-full text-left">
                <span className="flex aspect-[2/3] w-full items-center justify-center rounded-poster border border-dashed border-control text-faint transition-colors can-hover:group-hover:border-muted can-hover:group-hover:text-ink">
                  <Plus size={22} aria-hidden="true" />
                </span>
                <span className="mt-3 flex items-baseline gap-3">
                  <span className="display num text-[2.75rem] leading-[0.8] text-control md:text-[3.5rem]" aria-hidden="true">{index + 1}</span>
                  <span className="text-[15px] text-faint">Pick number {index + 1}</span>
                </span>
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
