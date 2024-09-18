import { createAPIClient } from "@/api/client";
import { serverRequestFn } from "@/api/serverRequestFn";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function Profile() {
  const qraft = createAPIClient({
    requestFn: serverRequestFn,
    baseUrl: "",
  });

  const profile = await qraft.profile.getProfile().catch(() => null);

  return (
    <section>
      <h2>👤 Profile</h2>
      {profile?.data?.email ? (
        <form
          action={async () => {
            "use server";

            void (await createAPIClient({
              requestFn: serverRequestFn,
              baseUrl: "",
            }).auth.logout(undefined));
            redirect("/");
          }}
        >
          <ul>
            <li>Email: {profile.data?.email}</li>
          </ul>
          <button type="submit">🔐 Sign out</button>
        </form>
      ) : (
        <Link href="/sign-in">🔓 Sign in</Link>
      )}
    </section>
  );
}
