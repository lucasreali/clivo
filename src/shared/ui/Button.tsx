import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BASE =
	"inline-flex h-[34px] shrink-0 items-center justify-center gap-2 rounded-field px-3.5 text-[13px] font-semibold whitespace-nowrap no-underline transition-colors disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
	primary:
		"bg-brand text-white hover:bg-brand-hover hover:text-white disabled:bg-neutral",
	secondary:
		"bg-panel text-ink border border-line hover:border-line-strong hover:text-ink disabled:text-faint",
	ghost: "text-muted hover:bg-neutral-soft hover:text-ink",
	danger:
		"bg-danger text-white hover:bg-danger-ink hover:text-white disabled:bg-neutral",
};

export function buttonClass(
	variant: ButtonVariant = "primary",
	extra?: string,
) {
	return cn(BASE, VARIANTS[variant], extra);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
};

export function Button({
	variant = "primary",
	className,
	type = "button",
	...rest
}: ButtonProps) {
	return (
		<ButtonPrimitive
			type={type}
			className={buttonClass(variant, className)}
			{...rest}
		/>
	);
}
