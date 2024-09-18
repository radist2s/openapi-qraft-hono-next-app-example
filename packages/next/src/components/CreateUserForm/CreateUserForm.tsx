"use client";
import { useFormState } from "react-dom";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createUserAction,
  CreateUserFormState,
} from "@/components/CreateUserForm/createUserAction";
import { requestFn } from "@openapi-qraft/react";
import { createAPIClient } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export function CreateUserForm() {
  const [formState, formAction, isFormPending] = useFormState<
    CreateUserFormState,
    FormData
  >(createUserAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const { back } = useRouter();

  const qraft = createAPIClient({
    requestFn,
    queryClient: useQueryClient(),
    baseUrl: "http://localhost:3000",
  });

  const { data: insertedUser, isLoading: isInsertedUserLoading } =
    qraft.users.findOne.useQuery(
      {
        path: { id: formState.data?.id ?? "" },
      },
      { enabled: Boolean(formState.data?.id) },
    );

  useEffect(() => {
    if (formState.data?.id) {
      formRef.current?.reset();
    }
  }, [formState.data?.id]);

  return (
    <form ref={formRef} action={formAction}>
      <fieldset
        style={{
          display: "flex",
          gap: "1rem",
          flexDirection: "column",
          maxWidth: 300,
        }}
      >
        <legend>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            👤 Create a new user
            <button
              aria-label="Close update user form"
              type="button"
              // For some reason, the `?edit_user` is required to clear the `{ searchParams }` for the `page.tsx`; btw, use `nuqs`
              onClick={() => void back()}
            >
              ✖︎
            </button>
          </span>
        </legend>

        <code>
          💡 `useFormState(...)` native React hook is being utilized in the form
          along with a Server Action.
        </code>

        <label>
          Name*{" "}
          <input
            name="name"
            type="text"
            placeholder="Name"
            disabled={isFormPending}
          />
        </label>
        <label>
          Age*{" "}
          <input
            name="age"
            type="number"
            inputMode="decimal"
            placeholder="Age"
            disabled={isFormPending}
            aria-describedby="age-description"
          />
          <div>
            <small id="age-description">Must be between 1 and 150</small>
          </div>
        </label>

        <button type="submit" disabled={isFormPending}>
          {isFormPending ? "🔃" : "➕"} Create
        </button>
        {formState.error && (
          <div>
            {formState.error.issues.map((error, errorIndex) => (
              <p key={errorIndex} style={{ color: "red" }} aria-live="polite">
                {error.message}
              </p>
            ))}
          </div>
        )}
        {formState.error?.issues.some(
          ({ code }) => code === "unauthorized",
        ) && <Link href="/sign-in">🔓 Sign in</Link>}

        {(insertedUser || isInsertedUserLoading) && (
          <fieldset>
            <legend>👤 User created</legend>
            {isInsertedUserLoading && (
              <div role="progressbar">🔃 Loading created user...</div>
            )}
            {insertedUser && (
              <>
                {insertedUser.name} — {insertedUser.age}{" "}
                <Link href={`/user/update/${insertedUser.id}`} replace>
                  🖍️ Edit user
                </Link>
              </>
            )}
          </fieldset>
        )}
      </fieldset>
    </form>
  );
}
