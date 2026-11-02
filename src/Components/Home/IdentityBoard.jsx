import { useState } from "react";
import { Heart, ShieldAlert } from "lucide-react";
import { tmdbImage } from "../../Services/images";
import { useProviders } from "../../Hooks/useCatalogReference";
import { regionName } from "../../Hooks/useRegion";
import { Reveal } from "../UI/Reveal";

// What an account gives you, shown as close-ups of the real interface on a board of tiles. Each
// tile crops one live element at large scale with its name in the corner.
function Tile({ span, tone = "bg-surface", title, line, children, index }) {
  return (
    <Reveal index={index % 3} className={`relative overflow-hidden rounded-panel ${tone} ${span}`}>
      <div data-ui className="absolute inset-0">{children}</div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-[18px] font-medium">{title}</p>
        <p className="mt-0.5 text-[15px] opacity-75">{line}</p>
      </div>
    </Reveal>
  );
}

function IdentityBoard({ films = [], region }) {
  const [rating, setRating] = useState(8);
  const [hearted, setHearted] = useState(true);
  const { data: providers = [] } = useProviders("movie", region);
  const five = films.filter((film) => film.posterPath).slice(0, 5);
  if (five.length < 5) return null;

  return (
    <section className="page section-gap" aria-labelledby="identity-title">
      <div className="grid auto-rows-[28vw] grid-cols-2 gap-2 md:auto-rows-[104px] md:grid-cols-12">
        <Reveal className="col-span-2 row-span-2 flex flex-col justify-between rounded-panel bg-raised p-6 md:col-span-6 md:row-span-2">
          <h2 id="identity-title" className="display text-[clamp(2.25rem,1.5rem+2.4vw,3.75rem)] leading-[0.98] text-ink">A profile that is yours</h2>
          <p className="max-w-[44ch] text-[15px] text-muted">Rate, log and pick favourites, and Cinefile builds your film identity from it.</p>
        </Reveal>

        <Tile index={1} span="col-span-2 row-span-3 md:col-span-6 md:row-span-4" title="Your five" line="The films that open your profile">
          <div className="absolute -right-6 top-6 flex gap-3">
            {five.map((film, at) => (
              <img
                key={film.id}
                src={tmdbImage(film.posterPath, "w342")}
                alt={`${film.title} poster`}
                width="150"
                height="225"
                loading="lazy"
                className="w-[24vw] rounded-poster shadow-poster md:w-[150px]"
                style={{ transform: `translateY(${at % 2 ? 22 : 0}px)` }}
              />
            ))}
          </div>
        </Tile>

        <Tile index={2} span="col-span-1 row-span-2 md:col-span-3 md:row-span-4" tone="bg-accent text-accent-ink" title="Out of ten" line="Scores kept apart from TMDB's">
          <div className="absolute -left-2 top-8 flex items-end gap-1.5" role="radiogroup" aria-label="Try the rating">
            {Array.from({ length: 10 }, (_, at) => (
              <button
                key={at}
                type="button"
                role="radio"
                aria-checked={rating === at + 1}
                aria-label={`${at + 1} out of 10`}
                onClick={() => setRating(at + 1)}
                className={`w-6 rounded-[4px] transition-[background-color,height] md:w-7 ${at < rating ? "bg-accent-ink" : "bg-accent-ink/20"}`}
                style={{ height: 40 + at * 10 }}
              />
            ))}
          </div>
          <span className="num display absolute right-5 top-4 text-[64px] leading-none">{rating}</span>
        </Tile>

        <Tile index={3} span="col-span-1 row-span-2 md:col-span-3 md:row-span-2" title="Wishlist anything" line="Even before you sign up">
          <button
            type="button"
            aria-pressed={hearted}
            aria-label="Try the wishlist heart"
            onClick={() => setHearted((value) => !value)}
            className={`absolute -right-6 -top-6 flex h-36 w-36 items-center justify-center rounded-full transition-colors ${hearted ? "bg-accent text-accent-ink" : "bg-raised text-ink"}`}
          >
            <Heart size={60} fill={hearted ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        </Tile>

        <Tile index={4} span="col-span-1 row-span-2 md:col-span-3 md:row-span-2" tone="bg-light text-light-ink" title="Spoilers stay shut" line="Covered until a reader opens them">
          <span className="absolute left-5 top-5 inline-flex items-center gap-2.5 rounded-full bg-light-ink px-5 py-3 text-[20px] font-medium text-light">
            <ShieldAlert size={22} aria-hidden="true" /> Contains spoilers
          </span>
        </Tile>

        <Tile index={5} span="col-span-1 row-span-2 md:col-span-6 md:row-span-2" title={`Streaming in ${regionName(region)}`} line="Where every title is, for your country">
          <div className="absolute -right-4 top-4 flex gap-3">
            {providers.slice(0, 6).map((provider) => (
              <img key={provider.id} src={tmdbImage(provider.logoPath, "w154")} alt={provider.name} width="76" height="76" loading="lazy" className="h-[76px] w-[76px] rounded-[18px]" />
            ))}
          </div>
        </Tile>
      </div>
    </section>
  );
}

export default IdentityBoard;
