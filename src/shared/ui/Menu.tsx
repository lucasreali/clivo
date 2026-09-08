import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "./cn";

type MenuProps = {
	label: string;
	children: React.ReactNode;
};

export function Menu({ label, children }: MenuProps) {
	return (
		<MenuPrimitive.Root>
			<MenuPrimitive.Trigger
				aria-label={label}
				className="flex h-6 w-5 items-center justify-center text-[12.5px] text-faint hover:text-ink data-popup-open:text-ink"
			>
				⋯
			</MenuPrimitive.Trigger>
			<MenuPrimitive.Portal>
				<MenuPrimitive.Positioner align="end" sideOffset={4} className="z-50">
					<MenuPrimitive.Popup className="flex w-[184px] flex-col rounded-field border border-line bg-panel py-1 shadow-[0_8px_24px_rgba(44,44,42,0.12)] outline-none transition-[opacity,scale] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
						{children}
					</MenuPrimitive.Popup>
				</MenuPrimitive.Positioner>
			</MenuPrimitive.Portal>
		</MenuPrimitive.Root>
	);
}

type MenuItemProps = {
	onClick: () => void;
	disabled?: boolean;
	danger?: boolean;
	children: React.ReactNode;
};

export function MenuItem({
	onClick,
	disabled,
	danger,
	children,
}: MenuItemProps) {
	return (
		<MenuPrimitive.Item
			disabled={disabled}
			onClick={onClick}
			className={cn(
				"cursor-pointer px-3 py-2 text-left text-[12.5px] outline-none data-disabled:cursor-default data-disabled:text-faint data-highlighted:bg-neutral-soft",
				danger ? "text-danger-ink" : "text-ink",
			)}
		>
			{children}
		</MenuPrimitive.Item>
	);
}
