import { createAPIClient } from "@/api/client";
import { Users } from "@/components/Users";
import { CreateUserForm } from "@/components/CreateUserForm/CreateUserForm";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { parsePageNumber } from "@/utils/parsePageNumber";
import { serverRequestFn } from "@/api/client/serverRequestFn";
import { UpdateUserForm } from "@/components/UpdateUserForm/UpdateUserForm";

export default async function Page({
  params,
  searchParams,
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

  const userIdToUpdate = searchParams.edit_user;

  await Promise.all([
    qraft.users.findAll.prefetchQuery({
      parameters: { query: { limit: limit, page } },
    }),
    userIdToUpdate &&
      qraft.users.findOne.prefetchQuery({
        parameters: { path: { id: userIdToUpdate } },
      }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
        <Users usersPerPage={limit} />
        {!userIdToUpdate && <CreateUserForm />}
        {userIdToUpdate && (
          <UpdateUserForm key={userIdToUpdate} userId={userIdToUpdate} />
        )}
      </div>
    </HydrationBoundary>
  );
}
