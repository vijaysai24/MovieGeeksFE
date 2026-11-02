import { Link } from "react-router-dom";
import { ListOrdered, Lock } from "lucide-react";
import { tmdbImage } from "../../Services/images";
import { plural } from "../../Services/format";
import { Avatar } from "../UI/Avatar";
import { Skeleton } from "../UI/States";

// Up to three covers, fanned left to right; empty slots stay as quiet panels so every card in a grid
// keeps the same shape.
function Covers({ posters = [] }) {
  return (
    <div className="flex">
      {[0, 1, 2].map((slot) => (
        <span
          key={slot}
          className={`block w-[38%] flex-none overflow-hidden rounded-poster bg-raised ring-2 ring-surface transition-transform duration-300 ease-[var(--ease-out-soft)] ${slot > 0 ? "-ml-[7%]" : ""}`}
          style={{ zIndex: 3 - slot }}
        >
          {posters[slot] ? (
            <img src={tmdbImage(posters[slot], "w185")} alt="" width="185" height="278" loading="lazy" className="aspect-[2/3] w-full object-cover" />
          ) : (
            <span className="block aspect-[2/3] w-full" />
          )}
        </span>
      ))}
    </div>
  );
}

export function ListCard({ list, showAuthor = true }) {
  return (
    <Link to={`/lists/${list.id}`} className="group block rounded-panel bg-surface p-4 transition-colors can-hover:hover:bg-raised">
      <Covers posters={list.coverPosters} />
      <h3 className="mt-4 flex items-center gap-2 text-ui font-medium text-ink can-hover:group-hover:text-accent">
        <span className="truncate">{list.name}</span>
        {!list.isPublic && <Lock size={14} className="flex-none text-faint" aria-label="Private" />}
      </h3>
      <p className="num mt-1 flex items-center gap-1.5 text-[13px] text-faint">
        {list.isRanked && <ListOrdered size={13} aria-label="Ranked" />}
        {plural(list.itemCount, "title")}
      </p>
      {showAuthor && list.author && (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-muted">
          <Avatar user={list.author} size="xs" />
          <span className="truncate">{list.author.name}</span>
        </p>
      )}
    </Link>
  );
}

export function ListCardSkeleton() {
  return <Skeleton className="h-[260px] w-full rounded-panel" />;
}

export function ListGrid({ children }) {
  return <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">{children}</div>;
}
