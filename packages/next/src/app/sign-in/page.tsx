/**
 * Fully Server-Side Component with Server Action in the `<form action />`
 */

import { createAPIClient } from "@/api/client";
import { serverRequestFn } from "@/api/serverRequestFn";
import { redirect, RedirectType } from "next/navigation";

export default function SignInPage() {
  return (
    <form
      action={async (formData) => {
        "use server";
        const qraft = createAPIClient({
          requestFn: serverRequestFn,
          baseUrl: "",
        });

        await qraft.auth.login({
          body: formData,
          parameters: {
            query: { mode: "cookie" },
          },
        });

        redirect("/", RedirectType.replace);
      }}
    >
      <fieldset
        style={{
          display: "flex",
          flexFlow: "column",
          gap: "1rem",
          maxWidth: 300,
        }}
      >
        <legend>Sign in</legend>
        <input
          type="email"
          name="email"
          placeholder="Email"
          defaultValue="test@example.com"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          defaultValue="123456"
        />
        <button type="submit">Sign in</button>
      </fieldset>
    </form>
  );
}
