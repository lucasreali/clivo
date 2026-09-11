import {
	Dialog,
	type DialogRootChangeEventDetails,
} from "@base-ui/react/dialog";
import { X } from "@phosphor-icons/react";
import { cn } from "./cn";
import { SCRIM } from "./motion";
import { useOpenTransition } from "./use-open-transition";

export type ModalDismissal = "free" | "guarded";

type ModalProps = {
	title: string;
	subtitle?: string;
	onClose: () => void;
	footer?: React.ReactNode;
	children: React.ReactNode;
	width?: string;
	dismissal?: ModalDismissal;
};

export function Modal({
	title,
	subtitle,
	onClose,
	footer,
	children,
	width = "max-w-[520px]",
	dismissal = "free",
}: ModalProps) {
	const isGuarded = dismissal === "guarded";
	const transition = useOpenTransition(onClose);

	function closeUnlessGuarded(
		isOpen: boolean,
		details: DialogRootChangeEventDetails,
	) {
		if (isOpen) {
			return;
		}
		if (isGuarded && details.reason === "escape-key") {
			details.cancel();
			return;
		}
		transition.close();
	}

	return (
		<Dialog.Root
			open={transition.isOpen}
			disablePointerDismissal={isGuarded}
			onOpenChange={closeUnlessGuarded}
			onOpenChangeComplete={transition.onSettled}
		>
			<Dialog.Portal>
				<Dialog.Backdrop
					className={cn(SCRIM, "duration-(--duration-overlay) ease-pop")}
				/>
				<Dialog.Popup
					className={cn(
						"-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-3rem)] w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-[0_24px_60px_rgba(44,44,42,0.2)] outline-none transition-[opacity,scale] duration-(--duration-overlay) ease-pop data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0",
						width,
					)}
				>
					<header className="flex items-start justify-between gap-4 border-line border-b px-5 py-4">
						<div className="flex flex-col gap-0.5">
							<Dialog.Title className="font-semibold text-[15px] text-ink">
								{title}
							</Dialog.Title>
							{subtitle ? (
								<Dialog.Description className="text-[12.5px] text-muted">
									{subtitle}
								</Dialog.Description>
							) : null}
						</div>
						<Dialog.Close
							aria-label="Close"
							className="text-faint hover:text-ink"
						>
							<X size={16} aria-hidden="true" />
						</Dialog.Close>
					</header>
					<div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
						{children}
					</div>
					{footer ? (
						<footer className="flex items-center justify-end gap-2 border-line border-t bg-surface px-5 py-3">
							{footer}
						</footer>
					) : null}
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
