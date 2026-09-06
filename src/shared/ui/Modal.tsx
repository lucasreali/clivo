import { useEffect } from "react";

type ModalProps = {
	title: string;
	subtitle?: string;
	onClose: () => void;
	footer?: React.ReactNode;
	children: React.ReactNode;
	width?: string;
};

export function Modal({
	title,
	subtitle,
	onClose,
	footer,
	children,
	width = "max-w-[520px]",
}: ModalProps) {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) =>
			event.key === "Escape" && onClose();

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(44,44,42,0.38)] p-6">
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				className={`flex max-h-full w-full ${width} flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-[0_24px_60px_rgba(44,44,42,0.2)]`}
			>
				<header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
					<div className="flex flex-col gap-0.5">
						<span className="text-[15px] font-semibold text-ink">{title}</span>
						{subtitle ? (
							<span className="text-[12.5px] text-muted">{subtitle}</span>
						) : null}
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Fechar"
						className="text-[18px] leading-none text-faint hover:text-ink"
					>
						×
					</button>
				</header>
				<div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
					{children}
				</div>
				{footer ? (
					<footer className="flex items-center justify-end gap-2 border-t border-line bg-surface px-5 py-3">
						{footer}
					</footer>
				) : null}
			</div>
		</div>
	);
}
