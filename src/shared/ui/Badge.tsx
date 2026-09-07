import { cn } from "./cn";
import { TONE_DOT, TONE_SURFACE, type Tone } from "./tone";

type BadgeProps = {
	tone?: Tone;
	children: React.ReactNode;
	withDot?: boolean;
};

export function Badge({
	tone = "neutral",
	children,
	withDot = true,
}: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap",
				TONE_SURFACE[tone],
			)}
		>
			{withDot ? (
				<span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[tone])} />
			) : null}
			{children}
		</span>
	);
}
