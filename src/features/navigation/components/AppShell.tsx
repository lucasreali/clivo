import { Sidebar } from "./Sidebar";

type AppShellProps = {
	user: string;
	role: string;
	clinic: string;
	children: React.ReactNode;
};

export function AppShell({ user, role, clinic, children }: AppShellProps) {
	return (
		<div className="flex h-screen w-full overflow-hidden bg-surface">
			<Sidebar user={user} role={role} clinic={clinic} />
			<div className="flex min-w-0 flex-1 flex-col">{children}</div>
		</div>
	);
}

type PageProps = {
	children: React.ReactNode;
};

export function Page({ children }: PageProps) {
	return (
		<main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
			{children}
		</main>
	);
}
