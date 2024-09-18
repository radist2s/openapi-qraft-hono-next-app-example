import { createAPIClient } from "@/api/client";
import { Users } from "@/components/Users/Users";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { serverRequestFn } from "@/api/serverRequestFn";
import Link from "next/link";
import { parsePageNumber } from "@/components/Users/parsePageNumber";
import { redirect } from "next/navigation";
import { Profile } from "@/components/Profile";
export default async function Page({
  params,
}: {
  params: { page?: string[] };
  searchParams: { edit_user?: string };
}) {
  const queryClient = new QueryClient();
  const qraft = createAPIClient({
    requestFn: serverRequestFn,
    baseUrl: "",
    queryClient,
  });

  const page = parsePageNumber(params);
  const limit = 10;

  const users = await qraft.users.findAll.fetchQuery({
    parameters: { query: { limit: limit, page } },
  });

  const hasNextPage = Boolean(users?.length && users.length === limit);
  const hasPrevPage = Boolean(page > 1);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "start",
            flexFlow: "column",
          }}
        >
          <Link href={`/user/create`} role="button">
            ➕️ Create user
          </Link>

          {Boolean(users?.length) && <Users usersPerPage={limit} />}
          {!users?.length && <section>👤 No users found</section>}

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {hasPrevPage ? (
              <Link href={page === 2 ? "/" : `/${page - 1}`}>
                ⏮︎ Prev page
              </Link>
            ) : (
              <div style={{ color: "gray" }}>⏮︎ Prev page</div>
            )}
            {hasNextPage ? (
              <Link href={`/${page + 1}`}>Next page ⏭︎</Link>
            ) : (
              <div style={{ color: "gray" }}>Next page ⏭︎</div>
            )}
          </div>
        </div>
        <Profile />
      </main>
    </HydrationBoundary>
  );
}
