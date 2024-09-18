"use client";

import { createAPIClient } from "@/api/client";
import { requestFn } from "@openapi-qraft/react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { parsePageNumber } from "@/utils/parsePageNumber";
import Link from "next/link";

export function Users({ usersPerPage }: { usersPerPage: number }) {
  const qraft = createAPIClient({
    requestFn,
    queryClient: useQueryClient(),
    baseUrl: "http://localhost:3000",
  });

  const pageNumber = parsePageNumber(useParams());
  const router = useRouter();

  const { data: users, isLoading } = qraft.users.findAll.useQuery({
    query: { limit: usersPerPage, page: pageNumber },
  });

  const hasNextPage = Boolean(users?.length && users.length === usersPerPage);
  const hasPrevPage = Boolean(pageNumber > 1);

  return (
    <div style={{ maxWidth: "50%" }}>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>
            <Link
              href={`?edit_user=${user.id}`}
              style={{ wordBreak: "break-all" }}
            >
              {user.name} — {user.age}
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={!hasPrevPage || isLoading}
        onClick={() =>
          void router.push(pageNumber === 2 ? "./" : `${pageNumber - 1}`)
        }
      >
        {isLoading ? "🔃" : hasPrevPage ? "➖" : "⊖"} Prev page
      </button>
      <button
        type="button"
        disabled={!hasNextPage || isLoading}
        onClick={() => void router.push(`${pageNumber + 1}`)}
      >
        {isLoading ? "🔃" : hasNextPage ? "➕" : "🏁"} Next page
      </button>
    </div>
  );
}
