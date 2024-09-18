"use client";
import { useFormState } from "react-dom";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createUserAction,
  CreateUserFormState,
} from "@/components/CreateUserForm/createUserAction";

export function CreateUserForm() {
  const [formState, formAction, isFormPending] = useFormState<
    CreateUserFormState,
    FormData
  >(createUserAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const { push } = useRouter();

  useEffect(() => {
    if (formState.success) {
      formRef.current?.reset();
      push("/");
    }
  }, [formState.success, push]);

  return (
    <form
      ref={formRef}
      action={formAction}
      style={{
        position: "sticky",
        top: "1rem",
        border: "1px solid black",
        padding: "1rem",
        display: "flex",
        gap: "1rem",
        flexDirection: "column",
        maxWidth: 300,
      }}
    >
      <code>
        `useFormState(...)` native React hook is being utilized in the form
        along with a Server Action.
      </code>
      <h4>Create a new user</h4>
      <label>
        Name* <input name="name" type="text" placeholder="Name" />
      </label>
      <label>
        Age*{" "}
        <input name="age" type="number" inputMode="decimal" placeholder="Age" />
        <div>
          <small>Must be between 1 and 150</small>
        </div>
      </label>

      <button type="submit" disabled={isFormPending}>
        Create
      </button>
      {formState.errors && (
        <div>
          {formState.errors.map((error, errorIndex) => (
            <p key={errorIndex} style={{ color: "red" }} aria-live="polite">
              {error.message}
            </p>
          ))}
        </div>
      )}
    </form>
  );
}
