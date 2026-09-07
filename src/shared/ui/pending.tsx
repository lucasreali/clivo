import { Toaster as SonnerToaster, toast } from "sonner";
import { cn } from "./cn";

const NOTICE = "Funcionalidade ainda não construída";

export function announcePending(feature: string) {
	toast(NOTICE, {
		id: feature,
		icon: <PendingIcon />,
		description: `${feature} faz parte do desenho do CLIVO, mas ainda não tem implementação neste protótipo.`,
	});
}

export function Toaster() {
	return (
		<SonnerToaster
			position="bottom-right"
			offset={20}
			toastOptions={{
				unstyled: true,
				classNames: {
					toast:
						"flex w-full gap-2.5 rounded-field border border-line bg-panel p-3.5 shadow-[0_8px_24px_rgba(44,44,42,0.12)]",
					title: "text-[13px] font-semibold text-ink",
					description: "mt-1 text-[12px] leading-relaxed text-muted",
					icon: "mt-px shrink-0",
				},
			}}
		/>
	);
}

function PendingIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			className="text-warn"
			aria-hidden="true"
		>
			<circle cx="8" cy="8" r="6.2" />
			<path d="M8 4.6v4.2M8 11.2h.01" />
		</svg>
	);
}

type PendingActionProps = {
	feature: string;
	className?: string;
	children: React.ReactNode;
};

export function PendingAction({
	feature,
	className,
	children,
}: PendingActionProps) {
	return (
		<button
			type="button"
			onClick={() => announcePending(feature)}
			className={cn("whitespace-nowrap", className)}
		>
			{children}
		</button>
	);
}
