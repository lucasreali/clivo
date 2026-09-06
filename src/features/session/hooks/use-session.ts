import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useSignOut } from "#/api/gen/hooks";

export function useSignOutAction() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useSignOut({
		mutation: {
			onSuccess: async () => {
				queryClient.clear();
				await navigate({ to: "/login" });
			},
		},
	});
}
