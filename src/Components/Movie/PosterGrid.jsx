import { PosterCard, PosterCardSkeleton } from "./PosterCard";

const COLUMNS = {
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

export function PosterGrid({ items = [], loading = false, skeletonCount = 12, columns = 6, renderSubline, ratingOf }) {
  return (
    <div className={`grid gap-x-4 gap-y-8 ${COLUMNS[columns]}`}>
      {loading
        ? Array.from({ length: skeletonCount }, (_, index) => <PosterCardSkeleton key={index} />)
        : items.map((item, index) => (
          <PosterCard
            key={`${item.mediaType}:${item.id}`}
            item={item}
            eager={index < 6}
            sizes="(min-width: 1280px) 15vw, (min-width: 768px) 22vw, 45vw"
            subline={renderSubline?.(item)}
            userRating={ratingOf?.(item)}
          />
        ))}
    </div>
  );
}
