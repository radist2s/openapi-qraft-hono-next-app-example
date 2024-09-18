import { createAPIClient } from "@/api/client";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { serverRequestFn } from "@/api/serverRequestFn";
import { UpdateUserForm } from "@/components/UpdateUserForm/UpdateUserForm";

export default async function Page({ params }: { params: { id: string } }) {
  const queryClient = new QueryClient();
  const qraft = createAPIClient({
    requestFn: serverRequestFn,
    baseUrl: "",
    queryClient,
  });

  const userId = params.id;

  // Prefetch the user to simplify forms handling
  await qraft.users.findOne.prefetchQuery({
    parameters: { path: { id: userId } },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UpdateUserForm key={userId} userId={userId} />
    </HydrationBoundary>
  );
}
