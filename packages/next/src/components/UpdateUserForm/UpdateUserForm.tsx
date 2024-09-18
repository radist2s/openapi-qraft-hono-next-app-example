"use client";
import { useRef } from "react";
import { createAPIClient } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { requestFn } from "@openapi-qraft/react";
import { updateUserAction } from "./updateUserAction";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function UpdateUserForm({ userId }: { userId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const qraft = createAPIClient({
    requestFn,
    queryClient: useQueryClient(),
    baseUrl: "http://localhost:3000",
  });

  const { mutate, error, isSuccess, isPending } =
    qraft.users.update.useMutation(undefined, {
      async mutationFn(variables) {
        const { error, data: updatedUser } = await updateUserAction(
          variables.body, // Normal `FormData` from the form action
        );
        // We return the error as an object, to be compatible with the `useMutation` hook.
        // Otherwise, we would have to wrap the Component with an `<ErrorBoundary/>` to catch the error.
        if (error) throw error;
        return updatedUser;
      },
      onSuccess: async (updatedUser) => {
        qraft.users.findOne.setQueryData(
          {
            path: { id: userId },
          },
          updatedUser,
        );
        await Promise.all([
          qraft.users.findOne.invalidateQueries({
            parameters: { path: { id: userId } },
          }),
          qraft.users.findAll.invalidateQueries(),
        ]);

        formRef.current?.reset();
      },
    });

  const user = qraft.users.findOne.useQuery({ path: { id: userId } });

  const { back } = useRouter();

  const errorMessages =
    error instanceof Error
      ? [error.message]
      : error
        ? error.issues.map((issue) => issue.message)
        : undefined;

  return (
    <form ref={formRef} action={(formData) => mutate({ body: formData })}>
      <fieldset
        style={{
          display: "flex",
          flexFlow: "column",
          gap: "1rem",
          maxWidth: 300,
        }}
      >
        <legend>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            👤 Update user
            <button
              aria-label="Close update user form"
              type="button"
              // For some reason, the `?edit_user` is required to clear the `{ searchParams }` for the `page.tsx`; btw, use `nuqs`
              onClick={() => void back()}
            >
              ✖︎
            </button>
          </div>
        </legend>

        <code>
          💡 `useMutation(...)` hook from Qraft is being utilized in the form
          along with a Server Action.
        </code>
        <input type="hidden" name="id" value={userId} />

        <label>
          Name*{" "}
          <input
            name="name"
            autoFocus
            type="text"
            placeholder="Name"
            defaultValue={user.data?.name}
            disabled={isPending}
          />
        </label>
        <label>
          Age*{" "}
          <input
            name="age"
            type="number"
            inputMode="decimal"
            placeholder="Age"
            defaultValue={user.data?.age}
            disabled={isPending}
          />
          <div>
            <small>Must be between 1 and 150</small>
          </div>
        </label>

        <button type="submit" disabled={isPending}>
          {isPending ? "🔃" : "🖍️"} Update
        </button>

        {errorMessages && (
          <div>
            {errorMessages.map((error, errorIndex) => (
              <p key={errorIndex} style={{ color: "red" }} aria-live="polite">
                {error}
              </p>
            ))}
          </div>
        )}
        {error &&
          "issues" in error &&
          error?.issues.some(({ code }) => code === "unauthorized") && (
            <Link href="/sign-in">🔓 Sign in</Link>
          )}
        {isSuccess && (
          <div style={{ color: "green" }}>✅ Successfully updated</div>
        )}
      </fieldset>
    </form>
  );
}
