import { Heart } from "lucide-react";
import { titleKey, useLibraryKeys, useQuickWishlist } from "../../Hooks/useLibraryKeys";

// For rows of titles: reads the shared library keys, so a page of these makes no requests of its
// own. Works for guests too; their wishlist is kept in the browser until they sign in.
export function WishlistButton({ title, tone = "dark", showLabel = true }) {
  const keys = useLibraryKeys();
  const toggle = useQuickWishlist();
  const on = keys.wishlist.has(titleKey(title));

  const tones = {
    dark: on ? "bg-accent text-accent-ink" : "text-ink ring-1 ring-inset ring-control can-hover:hover:bg-white/[0.06]",
    light: on ? "bg-light-ink text-light" : "text-light-ink ring-1 ring-inset ring-[#9a9893] can-hover:hover:bg-black/[0.05]",
  };

  return (
    <button
      type="button"
      onClick={() => toggle(title, on)}
      aria-pressed={on}
      aria-label={showLabel ? undefined : on ? `Remove ${title.title} from wishlist` : `Add ${title.title} to wishlist`}
      className={`inline-flex h-10 flex-none items-center gap-2 rounded-full text-[15px] font-medium transition-[background-color,transform] duration-150 active:scale-[0.94] ${showLabel ? "px-4" : "w-10 justify-center"} ${tones[tone]}`}
    >
      <Heart size={16} fill={on ? "currentColor" : "none"} aria-hidden="true" />
      {showLabel && (on ? "On Your Wishlist" : "Wishlist")}
    </button>
  );
}
