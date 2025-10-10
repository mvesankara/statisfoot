"use client";

import { useFormState } from "react-dom";

import { assignPrimaryRole, type RoleUpdateState } from "./actions";

const INITIAL_STATE: RoleUpdateState = { status: "idle" };

type RoleAssignmentFormProps = {
  userId: string;
  currentRole: string | null;
  roles: string[];
};

export function RoleAssignmentForm({ userId, currentRole, roles }: RoleAssignmentFormProps) {
  const [state, formAction] = useFormState(assignPrimaryRole, INITIAL_STATE);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <label className="sr-only" htmlFor={`role-${userId}`}>
        Rôle principal
      </label>
      <select
        id={`role-${userId}`}
        name="role"
        defaultValue={currentRole ?? roles[0] ?? ""}
        className="rounded border border-neutral-300 px-2 py-1 text-sm"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
      >
        Mettre à jour
      </button>
      {state.status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-emerald-600" role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
