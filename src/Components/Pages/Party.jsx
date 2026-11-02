import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Crown, Heart, RefreshCw, Sparkles, Trophy, UserMinus, X } from "lucide-react";
import { partyApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { backdropSrcSet, tmdbImage, titleHref } from "../../Services/images";
import { plural } from "../../Services/format";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { Poster } from "../Movie/PosterCard";
import { TitlePicker } from "../Movie/TitlePicker";
import { Avatar } from "../UI/Avatar";
import { Button, IconButton, LinkButton } from "../UI/Button";
import { Dialog } from "../UI/Dialog";
import { TextInput } from "../UI/Field";
import { SectionHead } from "../UI/Section";
import { EmptyState, Skeleton, SkeletonText } from "../UI/States";

const refOf = (item) => `${item.mediaType}:${item.id}`;

function Tonight({ pick }) {
  if (!pick) {
    return (
      <section aria-labelledby="tonight-title" className="rounded-panel bg-surface p-6 md:p-8">
        <h2 id="tonight-title" className="text-h3 font-semibold text-ink">Tonight’s pick</h2>
        <p className="mt-2 max-w-[52ch] text-[15px] text-muted">No votes yet. Heart what you’d happily watch; the title with the most hearts wins.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="tonight-title" className="relative overflow-hidden rounded-panel bg-surface">
      {pick.backdropPath && (
        <>
          <img src={tmdbImage(pick.backdropPath, "w1280")} srcSet={backdropSrcSet(pick.backdropPath)} sizes="(min-width: 1024px) 66vw, 100vw" alt="" width="1280" height="720" className="absolute inset-0 h-full w-full object-cover" />
          <div className="scrim-left absolute inset-0" aria-hidden="true" />
          <div className="scrim-bottom absolute inset-0" aria-hidden="true" />
        </>
      )}
      <div className="relative flex min-h-[300px] items-end gap-6 p-6 md:min-h-[360px] md:p-8">
        <Link to={titleHref(pick)} className="hidden w-28 flex-none overflow-hidden rounded-poster shadow-poster sm:block md:w-36">
          <Poster path={pick.posterPath} title={pick.title} sizes="144px" />
        </Link>
        <div className="min-w-0">
          <p id="tonight-title" className="inline-flex items-center gap-1.5 text-ui font-medium text-accent"><Trophy size={16} aria-hidden="true" /> Tonight’s pick</p>
          <h3 className="display mt-2 text-[clamp(2rem,1.4rem+2.4vw,3.5rem)] leading-[1] text-ink">
            <Link to={titleHref(pick)} className="can-hover:hover:text-accent">{pick.title}</Link>
          </h3>
          <p className="num mt-3 text-ui text-muted">{pick.year || "TBA"} · {plural(pick.votes, "vote")}{pick.voters.length ? ` from ${pick.voters.join(", ")}` : ""}</p>
          <LinkButton to={titleHref(pick)} variant="accent" className="mt-6">See Where to Watch</LinkButton>
        </div>
      </div>
    </section>
  );
}

function Party() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [dialog, setDialog] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState("");
  const key = ["parties", "detail", Number(id)];

  const { data: party, isLoading, isError, error, refetch } = useQuery({ queryKey: key, queryFn: () => partyApi.get(id) });
  const { data: suggestions = [] } = useQuery({
    queryKey: ["parties", "suggestions", Number(id)],
    queryFn: () => partyApi.suggestions(id),
    enabled: Boolean(party),
  });

  useEffect(() => {
    if (party) document.title = `${party.name} · Watch Party · Cinefile`;
    return () => {
      document.title = "Cinefile";
    };
  }, [party]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  };
  const onError = (err) => toast.show(errorMessage(err), { tone: "error" });
  const run = (fn, success) => ({ mutationFn: fn, onSuccess: (result, variables) => { refresh(); if (success) toast.show(typeof success === "function" ? success(variables) : success); }, onError });

  const add = useMutation(run((title) => partyApi.addItem(id, title.mediaType, title.id), (title) => `Added ${title.title}`));
  const remove = useMutation(run((item) => partyApi.removeItem(id, item.mediaType, item.id), (item) => `Removed ${item.title}`));
  const vote = useMutation(run((item) => (item.viewerVoted ? partyApi.unvote(id, item.mediaType, item.id) : partyApi.vote(id, item.mediaType, item.id))));
  const invite = useMutation(run(() => partyApi.newInvite(id), "New invite code made. The old one no longer works."));
  const rename = useMutation(run(() => partyApi.rename(id, name.trim()), "Party renamed"));
  const removeMember = useMutation(run((member) => partyApi.removeMember(id, member.id), (member) => `${member.name} removed`));
  const end = useMutation({
    mutationFn: () => (party.isOwner ? partyApi.remove(id) : partyApi.leave(id)),
    onSuccess: () => {
      toast.show(party.isOwner ? "Party ended" : "You left the party");
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      navigate("/parties", { replace: true });
    },
    onError,
  });

  const copyInvite = async () => {
    const link = `${window.location.origin}/parties?code=${party.inviteCode}`;
    try {
      await navigator.clipboard.writeText(`Join my watch party “${party.name}” on Cinefile: ${link}`);
      toast.show("Invite copied");
    } catch {
      toast.show(`Invite code: ${party.inviteCode}`);
    }
  };

  if (isLoading) {
    return (
      <div className="page pt-10 md:pt-16" aria-busy="true">
        <Skeleton className="h-16 w-1/2" />
        <SkeletonText className="mt-6 max-w-md" lines={2} />
        <Skeleton className="mt-10 h-80 w-full rounded-panel" />
      </div>
    );
  }

  if (isError) {
    const missing = error?.response?.status === 404;
    return (
      <div className="page pb-10 pt-16">
        <h1 className="display text-h1">{missing ? "This party isn’t here" : "This party didn’t load"}</h1>
        <p className="mt-4 max-w-md text-read text-muted">{missing ? "It may have ended, or you’re not a member. Ask the host for an invite code." : "Try again in a moment."}</p>
        <div className="mt-8 flex gap-3">
          {!missing && <Button variant="primary" onClick={() => refetch()}>Try Again</Button>}
          <LinkButton to="/parties" variant="secondary">Your Parties</LinkButton>
        </div>
      </div>
    );
  }

  const chosen = new Set(party.items.map(refOf));
  const fresh = suggestions.filter((item) => !chosen.has(refOf(item)));

  return (
    <div className="page pb-10 pt-10 md:pt-16">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <Link to="/parties" className="text-ui text-muted can-hover:hover:text-ink">Watch Parties</Link>
          <h1 className="display mt-3 text-h1 leading-[1] text-ink">{party.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="flex -space-x-2" aria-hidden="true">
              {party.members.slice(0, 6).map((member) => <Avatar key={member.id} user={member} size="sm" className="ring-2 ring-ground" />)}
            </span>
            <span className="num text-[15px] text-muted">{plural(party.memberCount, "member")}, hosted by {party.isOwner ? "you" : party.owner.name}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button variant="primary" onClick={() => setDialog("invite")}>Invite Friends</Button>
          <Button variant="ghost" className="max-sm:px-3.5" onClick={() => setDialog("members")}>Members</Button>
          {party.isOwner && <Button variant="ghost" className="max-sm:px-3.5" onClick={() => { setName(party.name); setDialog("rename"); }}>Rename</Button>}
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-10">
        <div className="min-w-0 space-y-16">
          <Tonight pick={party.tonight} />

          <section aria-labelledby="shortlist-title">
            <SectionHead id="shortlist-title" title="The Shortlist" subtitle="Heart anything you’d watch. Most hearts wins." />
            {!party.items.length ? (
              <EmptyState icon={Sparkles} title="Nothing on the shortlist yet">Add a title on the right, or pick from what’s already on everyone’s wishlists.</EmptyState>
            ) : (
              <ol>
                {party.items.map((item, index) => {
                  const canRemove = party.isOwner || item.addedBy?.id === user?.id;
                  return (
                    <li key={refOf(item)} className="flex items-center gap-4 py-4">
                      <span className="num w-6 flex-none text-center text-[15px] text-faint">{index + 1}</span>
                      <Link to={titleHref(item)} className="w-12 flex-none overflow-hidden rounded-[6px]" tabIndex={-1} aria-hidden="true">
                        <Poster path={item.posterPath} title={item.title} sizes="48px" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={titleHref(item)} className="block truncate text-ui font-medium text-ink can-hover:hover:text-accent">{item.title}</Link>
                        <p className="num truncate text-[13px] text-faint">
                          {item.year || "TBA"}{item.addedBy ? ` · added by ${item.addedBy.id === user?.id ? "you" : item.addedBy.name}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => vote.mutate(item)}
                        disabled={vote.isPending}
                        aria-pressed={item.viewerVoted}
                        aria-label={`${item.viewerVoted ? "Remove your vote for" : "Vote for"} ${item.title}, ${plural(item.votes, "vote")}`}
                        title={item.voters.length ? `Voted by ${item.voters.join(", ")}` : undefined}
                        className={`num inline-flex h-10 flex-none items-center gap-2 rounded-full px-4 text-[15px] font-medium transition-[background-color,transform] active:scale-95 ${
                          item.viewerVoted ? "bg-accent text-accent-ink" : "bg-raised text-ink can-hover:hover:bg-nested"
                        }`}
                      >
                        <Heart size={16} fill={item.viewerVoted ? "currentColor" : "none"} aria-hidden="true" />
                        {item.votes}
                      </button>
                      {canRemove && (
                        <IconButton label={`Take ${item.title} off the shortlist`} onClick={() => remove.mutate(item)} disabled={remove.isPending}>
                          <X size={16} aria-hidden="true" />
                        </IconButton>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section aria-labelledby="add-title" className="rounded-panel bg-surface p-5 md:p-6">
            <h2 id="add-title" className="text-h3 font-semibold text-ink">Add to the Shortlist</h2>
            <div className="mt-4"><TitlePicker onPick={(title) => add.mutate(title)} chosen={chosen} disabled={add.isPending} /></div>
          </section>

          {fresh.length > 0 && (
            <section aria-labelledby="overlap-title" className="rounded-panel bg-surface p-5 md:p-6">
              <h2 id="overlap-title" className="text-h3 font-semibold text-ink">On Everyone’s Radar</h2>
              <p className="mt-1 text-[14px] text-faint">{party.memberCount > 1 ? "Titles more than one of you already wants to see." : "From your wishlist, until friends join."}</p>
              <ul className="mt-4 space-y-3">
                {fresh.slice(0, 6).map((item) => (
                  <li key={refOf(item)} className="flex items-center gap-3">
                    <span className="w-9 flex-none overflow-hidden rounded-[4px]"><Poster path={item.posterPath} title={item.title} sizes="36px" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-ink">{item.title}</span>
                      <span className="block truncate text-[13px] text-faint">{item.interestedUsernames.map((name) => `@${name}`).join(", ")}</span>
                    </span>
                    <Button size="sm" variant="secondary" onClick={() => add.mutate(item)} disabled={add.isPending}>Add</Button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {confirming ? (
              <>
                <Button variant="danger" onClick={() => end.mutate()} disabled={end.isPending}>{party.isOwner ? "End the Party for Everyone" : "Leave for Good"}</Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>Stay</Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setConfirming(true)}>{party.isOwner ? "End Party" : "Leave Party"}</Button>
            )}
          </div>
        </aside>
      </div>

      {dialog === "invite" && (
        <Dialog open onClose={() => setDialog(null)} title="Invite friends" size="sm">
          <p className="text-[15px] text-muted">Share the code, or copy a link that fills it in for them.</p>
          <p className="num mt-5 rounded-control bg-raised py-4 text-center text-[1.75rem] font-semibold tracking-[0.18em] text-ink" translate="no">{party.inviteCode}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" onClick={copyInvite}><Copy size={16} aria-hidden="true" /> Copy Invite</Button>
            {party.isOwner && (
              <Button variant="ghost" onClick={() => invite.mutate()} disabled={invite.isPending}><RefreshCw size={16} aria-hidden="true" /> New Code</Button>
            )}
          </div>
        </Dialog>
      )}

      {dialog === "members" && (
        <Dialog open onClose={() => setDialog(null)} title="Members" size="sm">
          <ul className="-mx-2 max-h-[60vh] overflow-y-auto overscroll-contain">
            {party.members.map((member) => (
              <li key={member.id} className="flex items-center gap-3 rounded-control px-2 py-2.5">
                <Link to={`/u/${member.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar user={member} size="md" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 truncate text-[15px] font-medium text-ink">
                      {member.name}{member.isOwner && <Crown size={13} className="text-accent" aria-label="Host" />}
                    </span>
                    <span className="block truncate text-[13px] text-faint">@{member.username}</span>
                  </span>
                </Link>
                {party.isOwner && !member.isOwner && (
                  <IconButton label={`Remove ${member.name} from the party`} onClick={() => removeMember.mutate(member)} disabled={removeMember.isPending}>
                    <UserMinus size={16} aria-hidden="true" />
                  </IconButton>
                )}
              </li>
            ))}
          </ul>
        </Dialog>
      )}

      {dialog === "rename" && (
        <Dialog open onClose={() => setDialog(null)} title="Rename party" size="sm">
          <form onSubmit={(event) => { event.preventDefault(); if (name.trim()) rename.mutate(undefined, { onSuccess: () => setDialog(null) }); }} className="space-y-4">
            <label htmlFor="rename-party" className="sr-only">Party name</label>
            <TextInput id="rename-party" name="party-name" autoComplete="off" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} autoFocus />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={!name.trim() || rename.isPending}>Save Name</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

export default Party;
