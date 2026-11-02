import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, PartyPopper, Ticket, Users } from "lucide-react";
import { partyApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { plural, timeAgo } from "../../Services/format";
import { Avatar } from "../UI/Avatar";
import { Button } from "../UI/Button";
import { TextInput } from "../UI/Field";
import { EmptyState, ErrorState, Skeleton } from "../UI/States";

const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{10}$/;

function StartParty() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const create = useMutation({
    mutationFn: () => partyApi.create(name.trim()),
    onSuccess: (party) => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      navigate(`/parties/${party.id}`);
    },
  });

  return (
    <form onSubmit={(event) => { event.preventDefault(); if (name.trim()) create.mutate(); }} className="rounded-panel bg-surface p-6 md:p-7">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-ink"><PartyPopper size={20} aria-hidden="true" /></span>
      <h2 className="mt-5 text-h3 font-semibold text-ink">Start a Party</h2>
      <p className="mt-1 text-[15px] text-muted">You host. Share the invite code with whoever is coming.</p>
      <label htmlFor="party-name" className="sr-only">Party name</label>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <TextInput id="party-name" name="party-name" autoComplete="off" maxLength={80} placeholder="Friday film club…" value={name} onChange={(event) => setName(event.target.value)} />
        <Button type="submit" variant="accent" disabled={!name.trim() || create.isPending}>Create Party</Button>
      </div>
      {create.isError && <p className="mt-2 text-sm text-negative" role="alert">{errorMessage(create.error)}</p>}
    </form>
  );
}

function JoinParty({ initialCode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [code, setCode] = useState(initialCode);
  const clean = code.trim().toUpperCase();
  const join = useMutation({
    mutationFn: () => partyApi.join(clean),
    onSuccess: (party) => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      navigate(`/parties/${party.id}`);
    },
  });

  return (
    <form onSubmit={(event) => { event.preventDefault(); if (CODE_PATTERN.test(clean)) join.mutate(); }} className="rounded-panel bg-surface p-6 md:p-7">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-raised text-ink"><Ticket size={20} aria-hidden="true" /></span>
      <h2 className="mt-5 text-h3 font-semibold text-ink">Join with a Code</h2>
      <p className="mt-1 text-[15px] text-muted">Got an invite? Codes are 10 letters and numbers.</p>
      <label htmlFor="party-code" className="sr-only">Invite code</label>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <TextInput
          id="party-code"
          name="invite-code"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="characters"
          maxLength={10}
          placeholder="K7QW2MZP4R"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="num uppercase tracking-[0.12em]"
        />
        <Button type="submit" variant="primary" disabled={!CODE_PATTERN.test(clean) || join.isPending}>Join Party</Button>
      </div>
      {join.isError && <p className="mt-2 text-sm text-negative" role="alert">{errorMessage(join.error)}</p>}
    </form>
  );
}

function Parties() {
  const [params] = useSearchParams();
  const { data: parties, isLoading, isError, refetch } = useQuery({ queryKey: ["parties", "mine"], queryFn: partyApi.mine });

  return (
    <div className="page pb-10 pt-10 md:pt-16">
      <header className="max-w-3xl">
        <h1 className="display text-h1 leading-[1] text-ink">Watch Parties</h1>
        <p className="mt-5 max-w-[56ch] text-lead text-muted">
          Plan a film night with friends. Everyone adds what they’d watch and votes; the title with the most votes is tonight’s pick.
        </p>
      </header>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <StartParty />
        <JoinParty initialCode={params.get("code") || ""} />
      </div>

      <section aria-labelledby="mine-title" className="mt-20">
        <h2 id="mine-title" className="display text-[clamp(1.75rem,1.3rem+1.3vw,2.375rem)] text-ink">Your Parties</h2>
        <div className="mt-6">
          {isLoading && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((index) => <Skeleton key={index} className="h-36 rounded-panel" />)}</div>}
          {isError && <ErrorState message="Your parties didn't load." onRetry={refetch} />}
          {parties && !parties.length && (
            <EmptyState icon={Users} title="No parties yet">Start one above, or join a friend’s with their code.</EmptyState>
          )}
          {parties?.length > 0 && (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {parties.map((party) => (
                <li key={party.id}>
                  <Link to={`/parties/${party.id}`} className="group block h-full rounded-panel bg-surface p-6 transition-colors can-hover:hover:bg-raised">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-h3 font-semibold text-ink can-hover:group-hover:text-accent">{party.name}</h3>
                      {party.isOwner && (
                        <span className="inline-flex h-6 flex-none items-center gap-1 rounded-full bg-accent px-2.5 text-[12px] font-medium text-accent-ink"><Crown size={12} aria-hidden="true" /> Host</span>
                      )}
                    </div>
                    <p className="num mt-2 text-[14px] text-faint">{plural(party.memberCount, "member")} · {plural(party.itemCount, "title")} on the shortlist</p>
                    <p className="mt-5 flex items-center gap-2 text-[13px] text-muted">
                      <Avatar user={party.owner} size="xs" />
                      Hosted by {party.isOwner ? "you" : party.owner.name} · started {timeAgo(party.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default Parties;
