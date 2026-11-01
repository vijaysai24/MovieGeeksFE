import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGuestWishlist } from "../../Services/guestWishlist";

// The page closes with the first screen of the product already open: claim a username.
function JoinField() {
  const navigate = useNavigate();
  const guestItems = useGuestWishlist();
  const [username, setUsername] = useState("midnightreels");
  const [prefers, setPrefers] = useState("movie");

  const cleaned = username.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30);

  const submit = (event) => {
    event.preventDefault();
    navigate(`/register?username=${encodeURIComponent(cleaned)}&prefers=${prefers}`);
  };

  return (
    <section className="mt-[clamp(120px,14vw,200px)] bg-accent text-accent-ink" aria-labelledby="join-title">
      <div className="mx-auto grid min-h-[84svh] max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-12 px-5 py-16 md:min-h-[90svh] md:grid-cols-12 md:px-8 md:py-10">
        <div className="flex flex-col justify-start md:col-span-5 md:justify-end md:pb-8">
          <h2 id="join-title" className="display text-[clamp(3.25rem,13vw,7rem)] leading-[0.92] md:text-[clamp(3.5rem,7vw,7rem)]">
            Start your film diary
          </h2>
          <p className="mt-6 max-w-[40ch] text-[17px] leading-relaxed">
            It's free.
            {guestItems.length > 0
              ? ` The ${guestItems.length} ${guestItems.length === 1 ? "title" : "titles"} you saved on this visit come with you.`
              : " Anything you save before signing up comes with you."}
          </p>
        </div>

        <form
          data-ui
          onSubmit={submit}
          className="self-end rounded-xl bg-surface p-6 text-ink shadow-[0_24px_60px_rgba(60,35,0,0.35)] md:col-span-5 md:col-start-7 md:self-center md:p-7 lg:col-span-4 lg:col-start-8"
          aria-label="Claim your username"
        >
          <p className="text-lg font-semibold">Claim your username</p>
          <p className="mt-1 text-sm text-muted">This is how friends will find your profile.</p>
          <label htmlFor="join-username" className="mt-6 block text-sm font-medium">Username</label>
          <div className="mt-2 flex h-11 items-center rounded-lg bg-raised px-3.5 ring-1 ring-inset ring-transparent focus-within:ring-ink/60">
            <span className="max-w-[55%] flex-none truncate text-faint">{window.location.host}/u/</span>
            <input
              id="join-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              aria-describedby="join-username-hint"
              autoComplete="username"
              className="min-w-0 flex-1 bg-transparent text-base text-ink focus:outline-none"
            />
          </div>
          <p id="join-username-hint" className="mt-2 text-[13px] text-faint">Lowercase letters, numbers and underscores.</p>

          <p className="mt-6 text-sm font-medium" id="join-prefers">I mostly watch</p>
          <div role="radiogroup" aria-labelledby="join-prefers" className="mt-2 grid grid-cols-2 rounded-full bg-raised p-1">
            {[["movie", "Films"], ["tv", "Series"]].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={prefers === value}
                onClick={() => setPrefers(value)}
                className={`h-9 rounded-full text-sm transition-colors ${prefers === value ? "bg-ink font-medium text-ground" : "text-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={cleaned.length < 3}
            className="mt-7 h-12 w-full rounded-full bg-ink text-base font-medium text-ground transition-[background-color,transform] hover:bg-[#dcdcdc] active:scale-[0.98] disabled:opacity-60"
          >
            Continue as @{cleaned || "..."}
          </button>
        </form>
      </div>
    </section>
  );
}

export default JoinField;
