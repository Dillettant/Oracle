import { FormEvent, useEffect, useState } from "react";

import { fetchProfile, updateProfile, type UserProfile } from "../services/user";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchProfile()
      .then((data) => {
        if (!isMounted) return;
        setProfile(data);
        setFullName(data.full_name ?? "");
        setUsername(data.username ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      })
      .catch((error) => {
        if (!isMounted) return;
        setMessage(error instanceof Error ? error.message : "Unable to load profile.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSaving(true);
    try {
      const updated = await updateProfile({
        full_name: fullName || null,
        username: username || null,
        avatar_url: avatarUrl || null,
      });
      setProfile(updated);
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-1">
      <div className="grid w-full gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-ink">User Profile</h2>
        <p className="mt-2 text-sm text-slate-500">
          Update your public identity and how the team recognizes you.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              value={profile?.email ?? ""}
              disabled
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Full Name
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ada Lovelace"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Username</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="quant-operator"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Avatar URL
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60"
            disabled={isLoading || isSaving}
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
          {message ? <p className="text-sm text-amber-700">{message}</p> : null}
        </form>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Identity Snapshot</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-xl font-semibold text-white">
              {profile?.full_name?.[0] ?? profile?.email?.[0] ?? "O"}
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">
                {profile?.full_name || "New Strategist"}
              </p>
              <p className="text-sm text-slate-500">{profile?.email ?? "Loading..."}</p>
            </div>
          </div>
          <div className="mt-6 space-y-2 text-sm text-slate-500">
            <p>Account status: {profile?.is_active ? "Active" : "Inactive"}</p>
            <p>Verification: {profile?.is_verified ? "Verified" : "Pending"}</p>
            <p>Last updated: {profile?.updated_at ?? "-"}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Security</p>
          <p className="mt-3 text-sm text-slate-500">
            Password and multi-factor settings will arrive in the next milestone.
          </p>
        </div>
      </aside>
      </div>
    </div>
  );
}
