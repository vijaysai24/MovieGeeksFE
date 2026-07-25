import { Link } from "react-router-dom";
import { FaFilm, FaHeart, FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] text-[#888] text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="text-xl font-black text-white flex items-center gap-2">
              <FaFilm className="text-amber-500" />
              <span>Movie<span className="text-amber-500">Geek</span></span>
            </Link>
            <p className="text-xs text-[#666] leading-relaxed">
              A curated space for film lovers, cinephiles, and visual storytellers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link to="/movie" className="hover:text-amber-400 transition-colors">Movies</Link></li>
              <li><Link to="/watchlist" className="hover:text-amber-400 transition-colors">Watch List</Link></li>
              <li><Link to="/tvshows" className="hover:text-amber-400 transition-colors">Tv Shows</Link></li>
            </ul>
          </div>

          {/* Genres / Topics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3">Community</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/profile" className="hover:text-amber-400 transition-colors">My Profile</Link></li>
              <li><span className="text-[#444] cursor-not-allowed">Top Reviews</span></li>
              <li><span className="text-[#444] cursor-not-allowed">Watchlists</span></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-[#aaa] hover:text-amber-400 hover:border-amber-500/40 transition-colors">
                <FaTwitter className="text-xs" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-[#aaa] hover:text-amber-400 hover:border-amber-500/40 transition-colors">
                <FaInstagram className="text-xs" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-[#aaa] hover:text-amber-400 hover:border-amber-500/40 transition-colors">
                <FaGithub className="text-xs" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#555]">
          <p>&copy; {currentYear} MovieGeek. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <FaHeart className="text-amber-500 text-[10px]" /> for film lovers
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;