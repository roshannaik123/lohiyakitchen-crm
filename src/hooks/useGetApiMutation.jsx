import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "./useApiMutation";
import useToken from "../api/usetoken";

export function useGetApiMutation({
  url,
  queryKey = ["getQuery"],
  params = {},
  options = {},
}) {
  const token = useToken();
  const {
    trigger,
    loading: mutationLoading,
    error: mutationError,
  } = useApiMutation();

  const combinedQueryKey = [...queryKey, params];

  const query = useQuery({
    queryKey: combinedQueryKey,
    queryFn: async () => {
      const response = await trigger({
        url,
        method: "get",
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return response;
    },
    // staleTime: 5 * 60 * 1000, 
    ...options,
  });

  return {
    ...query,
    loading: mutationLoading || query.isFetching,
    error: mutationError || query.error,
  };
}
