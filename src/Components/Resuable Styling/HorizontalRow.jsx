import { useRef } from "react";
import { FaStar, FaChevronLeft, FaChevronRight, FaTv } from "react-icons/fa";

function HorizontalRow({ title, shows }) {
  const rowRef = useRef(null);

  if (!shows?.length) return null;

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative mb-10 group/section">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <FaTv className="text-amber-500 text-base" />
          <span>{title}</span>
        </h2>

        {/* Scroll Control Arrows */}
        <div className="hidden md:flex items-center gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => handleScroll("left")}
            className="p-2 rounded-lg bg-[#111] border border-[#222] hover:border-amber-500/40 text-[#888] hover:text-white transition-all active:scale-95"
            aria-label="Scroll Left"
          >
            <FaChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="p-2 rounded-lg bg-[#111] border border-[#222] hover:border-amber-500/40 text-[#888] hover:text-white transition-all active:scale-95"
            aria-label="Scroll Right"
          >
            <FaChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Scroll Track */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {shows.map((show) => (
          <div
            key={show.id}
            className="min-w-45 md:min-w-52.5 bg-[#111] border border-[#222] rounded-xl overflow-hidden cursor-pointer group hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Show Poster */}
            <div className="relative aspect-2/3 overflow-hidden bg-[#181818]">
              <img
                src={
                  show.poster_path
                    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                    : "https://placehold.co/500x750/111111/444444?text=No+Poster"
                }
                alt={show.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Rating Tag */}
              <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-500/20 text-xs text-amber-400 font-bold">
                <FaStar className="text-[10px]" />
                <span>{show.vote_average ? show.vote_average.toFixed(1) : "N/A"}</span>
              </div>
            </div>

            {/* Show Meta */}
            <div className="p-3.5 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors line-clamp-1">
                  {show.name}
                </h3>
                <p className="text-[#666] text-xs mt-1 font-medium">
                  {show.first_air_date ? show.first_air_date.substring(0, 4) : "TBA"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HorizontalRow;