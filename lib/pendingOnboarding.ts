const STORAGE_KEY = "invitely:pendingOnboarding";

export interface PendingOnboarding {
  eventType: string;
  themeId: string;
  name1: string;
  name2?: string;
  eventDate: string;
  /** May be a data: URL if it was captured before there was a session --
   * see LoginForm.tsx, which uploads it to real Storage once authenticated. */
  photoUrl?: string;
}

/** Bridges the onboarding wizard's collected answers across the
 * signup -> "check your email" -> login gap. Supabase in this project
 * requires email confirmation, so there's no session immediately after
 * signUp() to create the event with -- the wizard's data has to survive
 * until the user actually logs in post-confirmation, at which point
 * `takePendingOnboarding` lets the login flow finish the job the wizard
 * already did the data-entry for, instead of making them redo it. */
export function savePendingOnboarding(data: PendingOnboarding) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private-browsing/storage-restricted contexts can throw here -- not
    // fatal, the account still gets created; the user just lands on an
    // empty dashboard and redoes onboarding once, same as before this change.
  }
}

export function takePendingOnboarding(): PendingOnboarding | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    localStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as PendingOnboarding;
  } catch {
    return null;
  }
}
