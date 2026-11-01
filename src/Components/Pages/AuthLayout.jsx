import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../../Services/catalogService";
import { backdropSrcSet, tmdbImage } from "../../Services/images";
import { Skeleton } from "../UI/States";

// Sign-in and sign-up share the split stage: a still from this week's films beside the form.
export function AuthLayout({ title, intro, children }) {
  const { data } = useQuery({
    queryKey: ["catalog", "list", "trending", "all"],
    queryFn: () => catalogApi.list("trending", { mediaType: "all" }),
    staleTime: 30 * 60 * 1000,
  });
  const still = data?.items.find((item) => item.backdropPath);

  return (
    <div className="md:grid md:min-h-[calc(100svh-64px)] md:grid-cols-2">
      <div className="relative hidden md:block">
        {still ? (
          <>
            <img
              src={tmdbImage(still.backdropPath, "w1280")}
              srcSet={backdropSrcSet(still.backdropPath)}
              sizes="50vw"
              alt={`Still from ${still.title}`}
              width="1280"
              height="720"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <p className="absolute inset-x-0 bottom-0 bg-paper px-6 py-4 text-[15px] text-muted">
              {still.title} <span className="text-faint">{still.year}</span>
            </p>
          </>
        ) : (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
      </div>
      <div className="flex items-center bg-paper px-5 py-14 md:px-14">
        <div className="mx-auto w-full max-w-[420px]">
          <h1 className="display text-[clamp(2.5rem,4vw,3.5rem)] text-ink">{title}</h1>
          {intro && <p className="mt-4 text-base text-muted">{intro}</p>}
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
