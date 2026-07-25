import { useState } from "react";
import {
    FaStar,
    FaFilm,
    FaBookmark,
    FaQuoteLeft,
    FaHeart,
    FaUserTag,
    FaVideo,
    FaFire,
    FaRegCheckCircle,
} from "react-icons/fa";

function Profile() {
    const [activeTab, setActiveTab] = useState("movies");

    const stats = [
        { title: "Movies Watched", value: "428", icon: <FaFilm />, trend: "+12 this month" },
        { title: "Reviews Written", value: "86", icon: <FaQuoteLeft />, trend: "4.8 avg length" },
        { title: "Watchlist Items", value: "74", icon: <FaBookmark />, trend: "18 priority" },
        { title: "Average Rating", value: "4.4", icon: <FaStar />, trend: "Top 5% Cinephile" },
    ];

    const genres = ["Sci-Fi", "Psychological Thriller", "Neo-Noir", "Crime Drama", "Mystery", "Adventure"];

    const topMovies = [
        {
            title: "Interstellar",
            year: "2014",
            director: "Christopher Nolan",
            rating: "5.0",
            poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            review:
                "Every time I watch it, I find something new. The emotional connection between Cooper and Murph combined with Hans Zimmer's score makes this an eternal masterpiece.",
            tags: ["Mind-Bending", "Emotional", "Cinematic"],
            rewatches: 7,
        },
        {
            title: "The Dark Knight",
            year: "2008",
            director: "Christopher Nolan",
            rating: "5.0",
            poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            review:
                "A perfect balance between action, philosophy, and character writing. Heath Ledger's Joker redefined superhero cinema into high art.",
            tags: ["Crime", "Philosophy", "Iconic"],
            rewatches: 5,
        },
        {
            title: "Blade Runner 2049",
            year: "2017",
            director: "Denis Villeneuve",
            rating: "4.9",
            poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
            review:
                "Pure visual poetry. Every single frame feels like gallery artwork while telling one of the most quiet, emotional sci-fi stories ever made.",
            tags: ["Atmospheric", "Visuals", "Futuristic"],
            rewatches: 4,
        },
    ];

    const directors = [
        { name: "Christopher Nolan", count: "11 films watched", tag: "Favorite" },
        { name: "Denis Villeneuve", count: "8 films watched", tag: "Visionary" },
        { name: "Martin Scorsese", count: "14 films watched", tag: "Classic" },
        { name: "David Fincher", count: "9 films watched", tag: "Master" },
        { name: "Quentin Tarantino", count: "9 films watched", tag: "Auteur" },
        { name: "Greta Gerwig", count: "4 films watched", tag: "Rising" },
    ];

    const actors = [
        { name: "Leonardo DiCaprio", roles: "Inception, Shutter Island" },
        { name: "Christian Bale", roles: "The Dark Knight, Prestige" },
        { name: "Cillian Murphy", roles: "Oppenheimer, Inception" },
        { name: "Ryan Gosling", roles: "Blade Runner 2049, Drive" },
        { name: "Saoirse Ronan", roles: "Little Women, Lady Bird" },
        { name: "Zendaya", roles: "Dune, Euphoria" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#e8e6e3] selection:bg-amber-500 selection:text-black font-sans">
            {/* Subtle film grain overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            <div className="relative z-10">
                {/* --- Hero Profile Header --- */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-transparent" />
                    <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 relative">
                        <div className="flex flex-col items-center text-center">
                            {/* Profile Avatar */}
                            <div className="relative mb-6">
                                <div className="absolute -inset-2 rounded-full bg-amber-500/20 blur-xl" />
                                <img
                                    src="https://pbs.twimg.com/profile_images/1990968763529740288/URXwmvIW.jpg"
                                    alt="Mahesh Babu"
                                    className="relative w-28 h-28 rounded-full object-cover border-2 border-amber-500/30 shadow-2xl"
                                />
                                {/* <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <FaStar className="text-[8px]" /> Pro
                                </div> */}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                                Sai Vijay
                            </h1>
                            <p className="text-amber-500/80 text-sm font-medium tracking-widest uppercase mb-4">
                                Cinephile
                            </p>
                            <p className="text-[#888] max-w-lg text-base leading-relaxed mb-6">
                                Software engineer by day, film analyst by night. I chase stories that challenge perception, scores that linger, and visuals that haunt.
                            </p>

                            {/* Genre Badges */}
                            <div className="flex flex-wrap justify-center gap-2 mb-8">
                                {genres.map((genre) => (
                                    <span
                                        key={genre}
                                        className="px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#333] text-[#999] text-xs hover:border-amber-500/40 hover:text-amber-400 transition-colors cursor-default"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>

                            {/* Favorite Quote Box */}
                            <div className="relative max-w-xl bg-[#111] border border-[#222] rounded-2xl p-5">
                                <FaQuoteLeft className="absolute -top-3 left-4 text-amber-500/40 text-lg" />
                                <p className="text-[#aaa] text-sm italic leading-relaxed text-center">
A film is – or should be – more like music than like fiction. It should be a progression of moods and feelings. The theme, what’s behind the emotion, the meaning, all that comes later.
– <b className="text-white">Stanley Kubrick</b>                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Stats Grid Section --- */}
                <section className="max-w-5xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {stats.map((item) => (
                            <div
                                key={item.title}
                                className="bg-[#111] border border-[#222] rounded-xl p-4 hover:border-amber-500/20 transition-colors group"
                            >
                                <div className="flex items-center gap-2 text-[#555] mb-2">
                                    <span className="text-xs group-hover:text-amber-500 transition-colors">{item.icon}</span>
                                    <span className="text-[11px] uppercase tracking-wider">{item.title}</span>
                                </div>
                                <div className="text-2xl font-black text-white">{item.value}</div>
                                <p className="text-[11px] text-amber-500/70 mt-1 font-medium">{item.trend}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- Navigation Tabs --- */}
                <div className="max-w-5xl mx-auto px-6 mb-8">
                    <div className="flex gap-1 bg-[#111] border border-[#222] rounded-xl p-1 w-fit">
                        {[
                            { id: "movies", label: "Top 3", icon: <FaFire /> },
                            { id: "favorites", label: "People", icon: <FaHeart /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? "bg-amber-500 text-black"
                                        : "text-[#666] hover:text-[#ccc]"
                                    }`}
                            >
                                <span className="text-xs">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Top Movies Section (Personal Canon) --- */}
                {(activeTab === "movies") && (
                    <section className="max-w-5xl mx-auto px-6 pb-20">
                        <div className="flex items-center gap-3 mb-6">
                            <FaFilm className="text-amber-500" />
                            <h2 className="text-xl font-black text-white">My Personal Canon</h2>
                            <span className="text-[#444] text-sm">— the films that define my taste</span>
                        </div>

                        <div className="space-y-4">
                            {topMovies.map((movie, idx) => (
                                <div
                                    key={movie.title}
                                    className="group bg-[#111] border border-[#222] rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Poster */}
                                        <div className="relative w-full md:w-48 h-64 md:h-auto flex-shrink-0 overflow-hidden">
                                            <img
                                                src={movie.poster}
                                                alt={movie.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 left-3 w-8 h-8 bg-black/80 backdrop-blur rounded-lg flex items-center justify-center text-amber-400 font-black text-sm border border-amber-500/30">
                                                {idx + 1}
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-amber-400 text-xs font-bold border border-amber-500/20">
                                                <FaStar className="text-[10px]" />
                                                <span>{movie.rating}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-amber-500/80 text-xs font-medium">{movie.director}</span>
                                                    <span className="text-[#444]">•</span>
                                                    <span className="text-[#666] text-xs">{movie.year}</span>
                                                </div>
                                                <h3 className="text-xl font-black text-white mb-3">{movie.title}</h3>
                                                <p className="text-[#999] text-sm leading-relaxed italic mb-4">
                                                    "{movie.review}"
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-wrap gap-2">
                                                    {movie.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-0.5 rounded-md bg-[#1a1a1a] text-[#777] text-[11px] border border-[#2a2a2a]"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-1 text-[#555] text-xs">
                                                    <FaFire className="text-[10px]" />
                                                    <span>{movie.rewatches} rewatches</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --- Favorites (Directors & Actors) Section --- */}
                {(activeTab === "favorites") && (
                    <section className="max-w-5xl mx-auto px-6 pb-20">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Visionary Directors */}
                            <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <FaVideo className="text-amber-500" />
                                    <h3 className="text-lg font-black text-white">Directors I Trust</h3>
                                </div>
                                <div className="space-y-2">
                                    {directors.map((director, index) => (
                                        <div
                                            key={director.name}
                                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#1a1a1a] transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-[#333] font-black text-sm w-4">{index + 1}</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#ddd] group-hover:text-white transition-colors">
                                                        {director.name}
                                                    </p>
                                                    <p className="text-[11px] text-[#555]">{director.count}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#1a1a1a] text-amber-500/80 border border-[#2a2a2a]">
                                                {director.tag}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Performers */}
                            <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <FaHeart className="text-amber-500" />
                                    <h3 className="text-lg font-black text-white">Favorite Performers</h3>
                                </div>
                                <div className="space-y-2">
                                    {actors.map((actor, index) => (
                                        <div
                                            key={actor.name}
                                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#1a1a1a] transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-[#333] font-black text-sm w-4">{index + 1}</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#ddd] group-hover:text-white transition-colors">
                                                        {actor.name}
                                                    </p>
                                                    <p className="text-[11px] text-[#555]">{actor.roles}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-amber-500/60">
                                                <FaStar className="text-[10px]" />
                                                <span className="text-[11px] font-bold">5.0</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default Profile;