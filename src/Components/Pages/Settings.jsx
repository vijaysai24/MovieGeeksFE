import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi, authApi, libraryApi } from "../../Services/userService";
import { errorMessage, setAccessToken } from "../../Services/api";
import { tmdbImage } from "../../Services/images";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { useRegion } from "../../Hooks/useRegion";
import { useRegions } from "../../Hooks/useCatalogReference";
import { AccountShell } from "../Layout/AccountShell";
import { Avatar } from "../UI/Avatar";
import { Button } from "../UI/Button";
import { Field, Select, TextArea, TextInput } from "../UI/Field";
import { Tabs } from "../UI/Tabs";

function Section({ title, description, children }) {
  return (
    <section className="grid gap-4 py-10 first:pt-2 md:grid-cols-[minmax(0,320px)_minmax(0,640px)] md:gap-10">
      <div>
        <h2 className="text-h3 font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 text-[15px] text-muted">{description}</p>}
      </div>
      <div className="rounded-2xl bg-surface p-5">{children}</div>
    </section>
  );
}

function ProfileSettings() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: user.name, username: user.username, bio: user.bio || "", bannerPath: user.bannerPath });

  const { data: favorites } = useQuery({ queryKey: ["me", "library", "favorites", "banner"], queryFn: () => libraryApi.favorites({ limit: 24 }) });
  const stills = (favorites?.items || []).filter((title) => title.backdropPath);

  const save = useMutation({
    mutationFn: () => profileApi.update({ name: form.name.trim(), username: form.username, bio: form.bio.trim(), bannerPath: form.bannerPath || null }),
    onSuccess: (updated) => {
      setUser(updated);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.show("Profile saved");
    },
  });

  const avatar = useMutation({
    mutationFn: (file) => (file ? profileApi.uploadAvatar(file) : profileApi.removeAvatar()),
    onSuccess: (updated) => {
      setUser(updated);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.show(updated.avatarUrl ? "Photo updated" : "Photo removed");
    },
    onError: (err) => toast.show(errorMessage(err), { tone: "error" }),
  });

  return (
    <>
      <Section title="Photo" description="JPEG, PNG or WebP, up to 2 MB. Without one, your initial is shown.">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar user={user} size="lg" />
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Upload a profile photo"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) avatar.mutate(file);
              event.target.value = "";
            }}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={avatar.isPending}>
            {avatar.isPending ? "Uploading…" : "Upload a Photo"}
          </Button>
          {user.avatarUrl && <Button variant="ghost" onClick={() => avatar.mutate(null)}>Remove</Button>}
        </div>
      </Section>

      <Section title="Profile" description="Your name, username and bio are public.">
        <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="space-y-4">
          <Field label="Name">{(props) => <TextInput required maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} {...props} />}</Field>
          <Field label="Username" hint="3–30 lowercase letters, numbers or underscores. Changing it changes your profile link.">
            {(props) => <TextInput required maxLength={30} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value.toLowerCase().replace(/\s/g, "") })} {...props} />}
          </Field>
          <Field label="Bio" hint={`${form.bio.length}/300`}>
            {(props) => <TextArea maxLength={300} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="What you watch, and why" className="min-h-24" {...props} />}
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Profile still</p>
            {stills.length ? (
              <div role="radiogroup" aria-label="Profile still" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  role="radio"
                  aria-checked={!form.bannerPath}
                  onClick={() => setForm({ ...form, bannerPath: null })}
                  className={`flex aspect-video items-center justify-center rounded-md bg-raised text-[13px] text-muted ${!form.bannerPath ? "ring-2 ring-ink" : ""}`}
                >
                  Your number one
                </button>
                {stills.map((title) => (
                  <button
                    key={`${title.mediaType}:${title.id}`}
                    type="button"
                    role="radio"
                    aria-checked={form.bannerPath === title.backdropPath}
                    aria-label={title.title}
                    onClick={() => setForm({ ...form, bannerPath: title.backdropPath })}
                    className={`overflow-hidden rounded-md ${form.bannerPath === title.backdropPath ? "ring-2 ring-ink" : ""}`}
                  >
                    <img src={tmdbImage(title.backdropPath, "w300")} alt="" width="300" height="169" loading="lazy" className="aspect-video w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Star some favourites and you can use a still from one of them here.</p>
            )}
          </div>

          {save.isError && <p className="text-sm text-negative" role="alert">{errorMessage(save.error)}</p>}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save Profile"}</Button>
          </div>
        </form>
      </Section>
    </>
  );
}

function AccountSettings() {
  const { user, signOut, startSession } = useAuth();
  const toast = useToast();
  const { region, setRegion } = useRegion();
  const { data: regions = [] } = useRegions();
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });

  const change = useMutation({
    mutationFn: () => authApi.changePassword(passwords),
    onSuccess: async (session) => {
      setAccessToken(session.token);
      await startSession(session);
      setPasswords({ currentPassword: "", newPassword: "" });
      toast.show("Password changed. Other devices have been signed out.");
    },
  });

  return (
    <>
      <Section title="Country" description="Release dates, cinema listings and streaming services follow this. It saves as soon as you pick.">
        <Select
          aria-label="Country"
          value={region}
          onChange={async (event) => {
            await setRegion(event.target.value);
            toast.show("Country saved");
          }}
          className="h-11 w-full"
        >
          {regions.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </Select>
      </Section>

      <Section title="Email" description="Used to sign in. Never shown on your profile.">
        <p className="text-[15px] text-ink">{user.email}</p>
      </Section>

      <Section title="Password" description="Changing it signs you out everywhere else.">
        <form onSubmit={(event) => { event.preventDefault(); change.mutate(); }} className="space-y-4">
          <Field label="Current password">
            {(props) => <TextInput type="password" autoComplete="current-password" required value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} {...props} />}
          </Field>
          <Field label="New password" hint="At least 8 characters, with a letter and a number.">
            {(props) => <TextInput type="password" autoComplete="new-password" required value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} {...props} />}
          </Field>
          {change.isError && <p className="text-sm text-negative" role="alert">{errorMessage(change.error)}</p>}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={change.isPending || !passwords.currentPassword || !passwords.newPassword}>
              {change.isPending ? "Changing…" : "Change Password"}
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Sign out" description="Ends this session on this device.">
        <Button variant="secondary" onClick={signOut}>Sign Out</Button>
      </Section>
    </>
  );
}

function Settings() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "account" ? "account" : "profile";

  return (
    <AccountShell title={view === "account" ? "Account Settings" : "Profile Settings"}>
      <Tabs
        label="Settings"
        value={view}
        onChange={(value) => setParams({ view: value })}
        tabs={[{ value: "profile", label: "Profile" }, { value: "account", label: "Account" }]}
      />
      <div className="mt-6">{view === "account" ? <AccountSettings /> : <ProfileSettings />}</div>
    </AccountShell>
  );
}

export default Settings;
