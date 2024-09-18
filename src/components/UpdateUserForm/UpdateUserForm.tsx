"use client";
import { useRef } from "react";
import { createAPIClient } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { requestFn } from "@openapi-qraft/react";
import { updateUserAction } from "./updateUserAction";
import { usePathname, useRouter } from "next/navigation";

export function UpdateUserForm({ userId }: { userId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const qraft = createAPIClient({
    requestFn,
    queryClient: useQueryClient(),
    baseUrl: "http://localhost:3000",
  });

  const { mutate, error, isSuccess } = qraft.users.update.useMutation(
    undefined,
    {
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
      async mutationFn(variables) {
        const { error, data: updatedUser } = await updateUserAction(
          variables.body,
        );
        // We return the error as an object, to be compatible with the `useMutation` hook.
        // Otherwise, we would have to wrap the Component with an `<ErrorBoundary/>` to catch the error.
        if (error) throw error;
        return updatedUser;
      },
    },
  );

  const user = qraft.users.findOne.useQuery({ path: { id: userId } });

  const pathname = usePathname();
  const { replace } = useRouter();

  const errors =
    error instanceof Error
      ? [error.message]
      : error
        ? error.issues.map((issue) => issue.message)
        : undefined;

  return (
    <form
      ref={formRef}
      action={(formData) => mutate({ body: formData })}
      style={{
        position: "sticky",
        top: "1rem",
        border: "1px solid black",
        padding: "1rem",
        display: "flex",
        flexFlow: "column",
        gap: "1rem",
        maxWidth: 300,
      }}
    >
      <code>
        `useMutation(...)` hook from Qraft is being utilized in the form along
        with a Server Action.
      </code>
      <input type="hidden" name="id" value={userId} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <h4>Update user</h4>
        <button
          aria-label="Close update user form"
          type="button"
          // For some reason, the `?edit_user` is required to clear the `{ searchParams }` for the `page.tsx`; btw, use `nuqs`
          onClick={() => void replace(`${pathname}?edit_user`)}
        >
          ✖︎
        </button>
      </div>
      <label>
        Name*{" "}
        <input
          name="name"
          type="text"
          placeholder="Name"
          defaultValue={user.data?.name}
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
        />
        <div>
          <small>Must be between 1 and 150</small>
        </div>
      </label>

      <button type="submit">Update</button>

      {errors && (
        <div>
          {errors.map((error, errorIndex) => (
            <p key={errorIndex} style={{ color: "red" }} aria-live="polite">
              {error}
            </p>
          ))}
        </div>
      )}
      {isSuccess && <div style={{ color: "green" }}>Successfully updated</div>}
    </form>
  );
}
