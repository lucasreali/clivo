import { useQueryClient } from "@tanstack/react-query";
import {
	listUsersQueryKey,
	useChangeUserRole,
	useDeactivateUser,
	useGrantUserModule,
	useListUsers,
	useRevokeUserModule,
} from "#/api/gen/hooks";
import type { RoleChangeRequestRoleEnumKey } from "#/api/gen/types";

export function useTeam() {
	const queryClient = useQueryClient();
	const refresh = () =>
		queryClient.invalidateQueries({ queryKey: listUsersQueryKey() });

	const users = useListUsers();
	const changeRole = useChangeUserRole({ mutation: { onSuccess: refresh } });
	const deactivate = useDeactivateUser({ mutation: { onSuccess: refresh } });

	return {
		users: users.data ?? [],
		isPending: users.isPending,
		error: changeRole.error ?? deactivate.error,
		isSaving: changeRole.isPending || deactivate.isPending,
		changeRole: (userId: string, role: RoleChangeRequestRoleEnumKey) =>
			changeRole.mutate({ path: { userId }, body: { role } }),
		deactivate: (userId: string) => deactivate.mutate({ path: { userId } }),
	};
}

export function useUserModules(userId: string) {
	const queryClient = useQueryClient();
	const refresh = () => queryClient.invalidateQueries();

	const grant = useGrantUserModule({ mutation: { onSuccess: refresh } });
	const revoke = useRevokeUserModule({ mutation: { onSuccess: refresh } });

	return {
		error: grant.error ?? revoke.error,
		isSaving: grant.isPending || revoke.isPending,
		grant: (code: string) => grant.mutate({ path: { userId, code } }),
		revoke: (code: string) => revoke.mutate({ path: { userId, code } }),
	};
}
