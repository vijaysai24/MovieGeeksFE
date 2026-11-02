import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "../../Services/userService";
import { titleHref } from "../../Services/images";
import { plural } from "../../Services/format";
import { Poster } from "../Movie/PosterCard";
import { Skeleton } from "../UI/States";

// How closely the viewer's taste runs with this member's: one number first, then the evidence.
export function TasteMatch({ username, name }) {
  const first = name.split(" ")[0];
  const { data: match, isLoading, isError } = useQuery({
    queryKey: ["taste-match", username],
    queryFn: () => identityApi.tasteMatch(username),
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return <Skeleton className="h-56 w-full rounded-panel" />;
  if (isError || !match) return null;

  if (match.score === null) {
    return (
      <section aria-labelledby="match-title" className="rounded-panel bg-surface p-6 md:p-8">
        <h2 id="match-title" className="text-h3 font-semibold text-ink">You and {first}</h2>
        <p className="mt-2 max-w-[52ch] text-[15px] text-muted">Not enough to compare yet. Rate a few films you've both seen and your taste match appears here.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="match-title" className="grid gap-8 rounded-panel bg-surface p-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-12 md:p-8">
      <div>
        <h2 id="match-title" className="text-ui text-muted">You and {first}</h2>
        <p className="num mt-2 text-[4.5rem] font-semibold leading-none tracking-tight text-accent">{match.score}<span className="text-[2rem] text-faint">%</span></p>
        <p className="mt-2 text-ui font-medium text-ink">Taste match</p>
        <p className="mt-1 text-[14px] text-faint">
          {match.basis === "ratings_and_genres" ? `From ${plural(match.sharedRatings, "title")} you've both rated, and the genres you watch` : "From the genres you both watch"}
        </p>
      </div>

      <div className="min-w-0 space-y-7">
        {match.sharedGenres.length > 0 && (
          <div>
            <h3 className="text-[14px] text-faint">You both go for</h3>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {match.sharedGenres.map((genre) => <li key={genre} className="rounded-full bg-raised px-3.5 py-1.5 text-[14px] text-ink">{genre}</li>)}
            </ul>
          </div>
        )}

        {match.loveTogether.length > 0 && (
          <div>
            <h3 className="text-[14px] text-faint">You both loved</h3>
            <ul className="mt-2.5 flex gap-3 overflow-x-auto hide-scrollbar">
              {match.loveTogether.map((title) => (
                <li key={`${title.mediaType}:${title.id}`} className="w-[76px] flex-none">
                  <Link to={titleHref(title)} className="group block" title={title.title}>
                    <span className="block overflow-hidden rounded-poster"><Poster path={title.posterPath} title={title.title} sizes="76px" /></span>
                    <span className="num mt-1.5 block text-[12px] leading-snug text-faint">You {title.yourRating}<br />{first} {title.theirRating}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {match.biggestDisagreement && (
          <p className="text-[15px] text-muted">
            Where you part ways:{" "}
            <Link to={titleHref(match.biggestDisagreement)} className="font-medium text-ink can-hover:hover:text-accent">{match.biggestDisagreement.title}</Link>
            <span className="num">. You gave it {match.biggestDisagreement.yourRating}, {first} gave it {match.biggestDisagreement.theirRating}.</span>
          </p>
        )}
      </div>
    </section>
  );
}
