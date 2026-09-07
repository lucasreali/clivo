import { Link, useParams } from "@tanstack/react-router";
import { useGetClinic } from "#/api/gen/hooks";
import { initialsOf } from "#/shared/format/name";
import {
	CLINIC_NAVIGATION,
	CONSOLE_NAVIGATION,
	type ConsoleNavigationItem,
} from "../model/console-navigation";

type ConsoleRailProps = {
	user: string;
	role: string;
};

export function ConsoleRail({ user, role }: ConsoleRailProps) {
	const { tenantId } = useParams({ strict: false });

	return (
		<aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-line bg-panel">
			<div className="flex h-16 shrink-0 items-center gap-2 border-b border-line px-5">
				<span className="h-2.5 w-2.5 rounded-sm bg-brand" />
				<span className="text-[17px] font-semibold tracking-[1.6px] text-ink">
					CLIVO
				</span>
				<span className="ml-auto rounded border border-line px-1.5 py-0.5 text-[9.5px] font-medium tracking-[1.1px] text-muted">
					CONSOLE
				</span>
			</div>

			<nav className="flex flex-col gap-0.5 px-2.5 py-3.5">
				{CONSOLE_NAVIGATION.map((item) => (
					<RailLink key={item.to} item={item} exact={item.to === "/console"} />
				))}
			</nav>

			{tenantId ? <OpenClinic tenantId={tenantId} /> : null}

			<div className="mt-auto flex items-center gap-2.5 border-t border-line px-4 py-3.5">
				<span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand-ink">
					{initialsOf(user)}
				</span>
				<span className="flex min-w-0 flex-col leading-tight">
					<span className="truncate text-[12.5px] text-ink">{user}</span>
					<span className="text-[11.5px] text-muted">{role}</span>
				</span>
			</div>
		</aside>
	);
}

function OpenClinic({ tenantId }: { tenantId: string }) {
	const clinic = useGetClinic({ path: { tenantId } });

	return (
		<div className="mx-4 flex flex-col gap-1.5 border-t border-line pt-3">
			<span className="text-[9.5px] font-medium tracking-[1.1px] text-muted">
				CLÍNICA ABERTA
			</span>
			<span className="text-[13px] leading-tight font-semibold text-ink">
				{clinic.data?.name ?? "Carregando…"}
			</span>
			<span className="font-mono text-[10.5px] tracking-[0.5px] text-muted">
				{clinic.data?.code ?? ""}
			</span>

			<nav className="mt-1.5 flex flex-col gap-0.5">
				{CLINIC_NAVIGATION.map((item) => (
					<RailLink key={item.to} item={item} params={{ tenantId }} />
				))}
			</nav>

			<Link
				to="/console"
				className="mt-1.5 text-[11.5px] text-muted hover:text-ink"
			>
				Fechar clínica
			</Link>
		</div>
	);
}

type RailLinkProps = {
	item: ConsoleNavigationItem;
	exact?: boolean;
	params?: { tenantId: string };
};

function RailLink({ item, exact = false, params }: RailLinkProps) {
	return (
		<Link
			to={item.to}
			params={params}
			activeOptions={{ exact }}
			className="flex items-center gap-2.5 rounded-field px-2.5 py-2 text-[13px] text-muted hover:bg-neutral-soft hover:text-ink"
			activeProps={{
				className:
					"bg-brand-soft font-semibold text-brand-ink hover:bg-brand-soft",
			}}
		>
			{({ isActive }) => (
				<>
					<svg
						width="15"
						height="15"
						viewBox="0 0 16 16"
						fill="none"
						stroke={isActive ? "#1D9E75" : "#8B8A83"}
						strokeWidth="1.4"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d={item.icon} />
					</svg>
					<span>{item.label}</span>
				</>
			)}
		</Link>
	);
}
