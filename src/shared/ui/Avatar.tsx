import { initialsOf } from "../format/name";
import { cn } from "./cn";

type AvatarProps = {
	name: string;
	size?: "xs" | "sm" | "md";
	tone?: "brand" | "neutral";
};

const SIZES = {
	xs: "h-[28px] w-[28px] text-[11px]",
	sm: "h-[30px] w-[30px] text-[12px]",
	md: "h-[44px] w-[44px] text-[15px]",
} as const;

const TONES = {
	brand: "bg-brand-soft text-brand-ink",
	neutral: "bg-neutral-soft text-muted",
} as const;

export function Avatar({ name, size = "sm", tone = "brand" }: AvatarProps) {
	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center rounded-full font-semibold",
				SIZES[size],
				TONES[tone],
			)}
		>
			{initialsOf(name)}
		</div>
	);
}
