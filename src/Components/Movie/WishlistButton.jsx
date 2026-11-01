import { Heart } from "lucide-react";
import { useTitleActions } from "../../Hooks/useTitleActions";

// Works for guests too: their wishlist is kept in the browser until they sign in.
export function WishlistButton({ title, tone = "dark", showLabel = true }) {
  const { state, toggleWishlist, saving } = useTitleActions(title);
  const on = state.wishlisted;

  const tones = {
    dark: on ? "bg-ink text-ground" : "text-ink ring-1 ring-inset ring-control hover:bg-white/[0.06]",
    light: on ? "bg-light-ink text-light" : "text-light-ink ring-1 ring-inset ring-[#9a9893] hover:bg-black/[0.05]",
  };

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      disabled={saving}
      aria-pressed={on}
      aria-label={showLabel ? undefined : on ? "Remove from wishlist" : "Add to wishlist"}
      className={`inline-flex h-9 items-center gap-2 rounded-full text-sm font-medium transition-[background-color,transform] duration-150 active:scale-[0.96] ${showLabel ? "px-4" : "w-9 justify-center"} ${tones[tone]}`}
    >
      <Heart size={16} fill={on ? "currentColor" : "none"} aria-hidden="true" />
      {showLabel && (on ? "On your wishlist" : "Wishlist")}
    </button>
  );
}
