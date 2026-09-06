import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
	primary: "bg-brand text-white hover:bg-brand-hover disabled:bg-neutral",
	secondary:
		"bg-panel text-ink border border-line hover:border-line-strong disabled:text-faint",
	ghost: "text-muted hover:bg-neutral-soft hover:text-ink",
	danger: "bg-danger text-white hover:bg-danger-ink disabled:bg-neutral",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: Variant;
};

export function Button({
	variant = "primary",
	className,
	type = "button",
	...rest
}: ButtonProps) {
	return (
		<button
			type={type}
			className={cn(
				"inline-flex h-[34px] items-center justify-center gap-2 rounded-field px-3.5 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed",
				VARIANTS[variant],
				className,
			)}
			{...rest}
		/>
	);
}
