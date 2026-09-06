import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { messageOf } from "#/shared/api-error";
import appCss from "#/styles.css?url";

export type RouterContext = {
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	ssr: false,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "CLIVO · Gestão clínica" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
	component: Outlet,
	errorComponent: RootError,
	notFoundComponent: NotFound,
});

function RootError({ error }: { error: Error }) {
	return (
		<Centered title="Não foi possível carregar a tela">
			<p className="m-0 text-[13px] leading-relaxed text-muted">
				{messageOf(error)}
			</p>
			<p className="m-0 text-[12px] leading-relaxed text-faint">
				Se o erro for de rede, confirme que a API está no ar em{" "}
				<code>API_PROXY_TARGET</code> e recarregue a página.
			</p>
			<button
				type="button"
				onClick={() => window.location.reload()}
				className="mt-1 h-[34px] rounded-field bg-brand px-3.5 text-[13px] font-semibold text-white"
			>
				Tentar novamente
			</button>
		</Centered>
	);
}

function NotFound() {
	return (
		<Centered title="Página não encontrada">
			<a href="/" className="text-[13px] font-semibold">
				Voltar para o painel do dia
			</a>
		</Centered>
	);
}

function Centered({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<main className="flex min-h-screen items-center justify-center bg-surface p-6">
			<div className="flex w-[420px] flex-col gap-3 rounded-xl border border-line bg-panel p-6">
				<span className="text-[15px] font-semibold text-ink">{title}</span>
				{children}
			</div>
		</main>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const { queryClient } = Route.useRouteContext();

	return (
		<html lang="pt-BR">
			<head>
				<HeadContent />
			</head>
			<body className="font-sans">
				<QueryClientProvider client={queryClient}>
					{children}
					<TanStackDevtools
						config={{ position: "bottom-right" }}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							{ name: "Tanstack Query", render: <ReactQueryDevtoolsPanel /> },
						]}
					/>
				</QueryClientProvider>
				<Scripts />
			</body>
		</html>
	);
}
