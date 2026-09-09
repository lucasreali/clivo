import { Toast } from "@base-ui/react/toast";
import { WarningCircle, X } from "@phosphor-icons/react";
import { cn } from "./cn";

const NOTICE = "Funcionalidade ainda não construída";

const notices = Toast.createToastManager();

export function announcePending(feature: string) {
	notices.add({
		id: feature,
		title: NOTICE,
		description: `${feature} faz parte do desenho do CLIVO, mas ainda não tem implementação neste protótipo.`,
	});
}

export function Toaster() {
	return (
		<Toast.Provider toastManager={notices}>
			<Toast.Portal>
				<Toast.Viewport className="fixed right-5 bottom-5 z-50 flex w-[360px] max-w-[calc(100vw-2.5rem)] flex-col gap-2">
					<Notices />
				</Toast.Viewport>
			</Toast.Portal>
		</Toast.Provider>
	);
}

function Notices() {
	const { toasts } = Toast.useToastManager();

	return toasts.map((notice) => (
		<Toast.Root
			key={notice.id}
			toast={notice}
			className="flex w-full gap-2.5 rounded-field border border-line bg-panel p-3.5 shadow-[0_8px_24px_rgba(44,44,42,0.12)] transition-[opacity,translate] duration-(--duration-overlay) ease-pop data-ending-style:translate-x-8 data-ending-style:opacity-0 data-starting-style:translate-x-8 data-starting-style:opacity-0"
		>
			<WarningCircle
				size={16}
				className="mt-px shrink-0 text-warn"
				aria-hidden="true"
			/>
			<div className="flex min-w-0 flex-col">
				<Toast.Title className="font-semibold text-[13px] text-ink" />
				<Toast.Description className="mt-1 text-[12px] text-muted leading-relaxed" />
			</div>
			<Toast.Close
				aria-label="Fechar"
				className="ml-auto h-fit shrink-0 text-faint hover:text-ink"
			>
				<X size={14} aria-hidden="true" />
			</Toast.Close>
		</Toast.Root>
	));
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
