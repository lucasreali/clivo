import { cn } from "./cn";
import { TONE_SURFACE, type Tone } from "./tone";

type CalloutProps = {
	tone?: Tone;
	title?: string;
	children: React.ReactNode;
};

export function Callout({ tone = "neutral", title, children }: CalloutProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-1 rounded-field px-3.5 py-3 text-[12.5px] leading-relaxed",
				TONE_SURFACE[tone],
			)}
		>
			{title ? <strong className="font-semibold">{title}</strong> : null}
			<span>{children}</span>
		</div>
	);
}
