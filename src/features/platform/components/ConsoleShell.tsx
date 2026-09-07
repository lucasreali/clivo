import { ConsoleRail } from "./ConsoleRail";

type ConsoleShellProps = {
	user: string;
	role: string;
	children: React.ReactNode;
};

export function ConsoleShell({ user, role, children }: ConsoleShellProps) {
	return (
		<div className="flex h-screen w-full overflow-hidden bg-surface">
			<ConsoleRail user={user} role={role} />
			<div className="flex min-w-0 flex-1 flex-col">{children}</div>
		</div>
	);
}
