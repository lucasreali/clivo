import {
	Drawer as DrawerPrimitive,
	type DrawerRootChangeEventDetails,
} from "@base-ui/react/drawer";
import { X } from "@phosphor-icons/react";
import { useState } from "react";
import { useIsCompactViewport } from "../use-viewport";
import { Button } from "./Button";
import { cn } from "./cn";

type DrawerSide = "right" | "left" | "bottom";

const PLACEMENTS = {
	right: {
		swipe: "right",
		viewport: "items-stretch justify-end",
		popup:
			"h-full w-full translate-x-(--drawer-swipe-movement-x) border-line border-l data-ending-style:translate-x-full data-starting-style:translate-x-full",
	},
	left: {
		swipe: "left",
		viewport: "items-stretch justify-start",
		popup:
			"h-full w-full translate-x-(--drawer-swipe-movement-x) border-line border-r data-ending-style:-translate-x-full data-starting-style:-translate-x-full",
	},
	bottom: {
		swipe: "down",
		viewport: "items-end justify-center",
		popup:
			"max-h-[85dvh] w-full translate-y-(--drawer-swipe-movement-y) rounded-t-xl border-line border-t data-ending-style:translate-y-full data-starting-style:translate-y-full",
	},
	sheet: {
		swipe: "down",
		viewport: "items-end justify-center",
		popup:
			"h-[92dvh] w-full translate-y-(--drawer-swipe-movement-y) rounded-t-xl border-line border-t data-ending-style:translate-y-full data-starting-style:translate-y-full",
	},
} as const;

type DrawerProps = {
	title: string;
	subtitle?: string;
	onClose: () => void;
	footer?: React.ReactNode;
	children: React.ReactNode;
	side?: DrawerSide;
	width?: string;
	isDirty?: boolean;
};

export function Drawer({
	title,
	subtitle,
	onClose,
	footer,
	children,
	side = "right",
	width = "max-w-[420px]",
	isDirty = false,
}: DrawerProps) {
	const [isDiscarding, setIsDiscarding] = useState(false);
	const isCompact = useIsCompactViewport();
	const placement = PLACEMENTS[isCompact ? "sheet" : side];

	function closeUnlessDirty(
		isOpen: boolean,
		details: DrawerRootChangeEventDetails,
	) {
		if (isOpen) {
			return;
		}
		if (isDirty) {
			details.cancel();
			setIsDiscarding(true);
			return;
		}
		onClose();
	}

	return (
		<DrawerPrimitive.Root
			open
			swipeDirection={placement.swipe}
			onOpenChange={closeUnlessDirty}
		>
			<DrawerPrimitive.Portal>
				<DrawerPrimitive.Backdrop className="fixed inset-0 z-50 bg-[rgba(44,44,42,0.38)] transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
				<DrawerPrimitive.Viewport
					className={cn("fixed inset-0 z-50 flex", placement.viewport)}
				>
					<DrawerPrimitive.Popup
						className={cn(
							"flex flex-col overflow-hidden bg-panel shadow-[0_24px_60px_rgba(44,44,42,0.2)] outline-none transition-transform duration-300 ease-out",
							placement.popup,
							!isCompact && width,
						)}
					>
						<header className="flex shrink-0 items-start justify-between gap-4 border-line border-b px-5 py-4">
							<div className="flex flex-col gap-0.5">
								<DrawerPrimitive.Title className="font-semibold text-[15px] text-ink">
									{title}
								</DrawerPrimitive.Title>
								{subtitle ? (
									<DrawerPrimitive.Description className="text-[12.5px] text-muted">
										{subtitle}
									</DrawerPrimitive.Description>
								) : null}
							</div>
							<DrawerPrimitive.Close
								aria-label="Fechar"
								className="text-faint hover:text-ink"
							>
								<X size={16} aria-hidden="true" />
							</DrawerPrimitive.Close>
						</header>
						<div className="flex min-h-0 grow flex-col gap-4 overflow-y-auto px-5 py-4">
							{children}
						</div>
						{isDiscarding ? (
							<DiscardPrompt
								onKeep={() => setIsDiscarding(false)}
								onDiscard={onClose}
							/>
						) : (
							<DrawerFooter>{footer}</DrawerFooter>
						)}
					</DrawerPrimitive.Popup>
				</DrawerPrimitive.Viewport>
			</DrawerPrimitive.Portal>
		</DrawerPrimitive.Root>
	);
}

function DrawerFooter({ children }: { children?: React.ReactNode }) {
	if (!children) {
		return null;
	}

	return (
		<footer className="flex shrink-0 items-center justify-end gap-2 border-line border-t bg-surface px-5 py-3">
			{children}
		</footer>
	);
}

type DiscardPromptProps = {
	onKeep: () => void;
	onDiscard: () => void;
};

function DiscardPrompt({ onKeep, onDiscard }: DiscardPromptProps) {
	return (
		<footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-line border-t bg-surface px-5 py-3">
			<span className="text-[12.5px] text-muted">
				As alterações ainda não foram salvas.
			</span>
			<span className="flex gap-2">
				<Button variant="secondary" autoFocus onClick={onKeep}>
					Continuar editando
				</Button>
				<Button variant="danger" onClick={onDiscard}>
					Descartar
				</Button>
			</span>
		</footer>
	);
}
