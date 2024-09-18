"use client";

import { createAPIClient } from "@/api/client";
import { requestFn } from "@openapi-qraft/react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { parsePageNumber } from "@/components/Users/parsePageNumber";

export function Users({ usersPerPage }: { usersPerPage: number }) {
  const qraft = createAPIClient({
    requestFn,
    queryClient: useQueryClient(),
    baseUrl: "http://localhost:3000",
  });

  const pageNumber = parsePageNumber(useParams());

  const { data: users, isFetching } = qraft.users.findAll.useQuery({
    query: { limit: usersPerPage, page: pageNumber },
  });

  return (
    <div>
      {isFetching && (
        <small
          aria-label="Refreshing users"
          aria-live="polite"
          style={{ position: "absolute" }}
        >
          🔃 Refreshing users...
        </small>
      )}
      <ul>
        {users?.map((user) => (
          <li key={user.id}>
            <Link
              href={`/user/update/${user.id}`}
              style={{ wordBreak: "break-all" }}
            >
              {user.name} — {user.age}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
