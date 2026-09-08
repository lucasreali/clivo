import { cn } from "./cn";

type LogoSize = "md" | "lg";

const MARK_SIZES = {
	md: "h-[18px] w-[18px]",
	lg: "h-[21px] w-[21px]",
} as const;

const WORD_SIZES = {
	md: "text-[17px]",
	lg: "text-[20px]",
} as const;

/* The slit between the two faces is transparent, never white: the mark keeps
   its reading over the light shell and over the dark console alike, so the
   negative lockup needs no second file. */
export function LogoMark({
	size = "md",
	className,
}: {
	size?: LogoSize;
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 32 32"
			aria-hidden="true"
			className={cn("shrink-0", MARK_SIZES[size], className)}
		>
			<path fill="#0e5a3e" d="M0 0h32v7.2L0 19.4Z" />
			<path fill="#2f8f68" d="M0 22.4 32 10.2V32H0Z" />
		</svg>
	);
}

export function Logo({ size = "md" }: { size?: LogoSize }) {
	return (
		<span className="flex items-center gap-2">
			<LogoMark size={size} />
			<span
				className={cn(
					"font-semibold tracking-[1.6px] text-ink",
					WORD_SIZES[size],
				)}
			>
				CLIVO
			</span>
		</span>
	);
}
