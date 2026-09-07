export const TONES = ["brand", "warn", "info", "danger", "neutral"] as const;

export type Tone = (typeof TONES)[number];

export const TONE_SURFACE: Record<Tone, string> = {
	brand: "bg-brand-soft text-brand-ink",
	warn: "bg-warn-soft text-warn-ink",
	info: "bg-info-soft text-info-ink",
	danger: "bg-danger-soft text-danger-ink",
	neutral: "bg-neutral-soft text-neutral-ink",
};

export const TONE_TEXT: Record<Tone, string> = {
	brand: "text-brand",
	warn: "text-warn",
	info: "text-info",
	danger: "text-danger",
	neutral: "text-ink",
};

export const TONE_DOT: Record<Tone, string> = {
	brand: "bg-brand",
	warn: "bg-warn",
	info: "bg-info",
	danger: "bg-danger",
	neutral: "bg-neutral",
};

export const TONE_BLOCK: Record<Tone, string> = {
	brand: "border-l-brand bg-brand-soft text-brand-ink",
	warn: "border-l-warn bg-warn-soft text-warn-ink",
	info: "border-l-info bg-info-soft text-info-ink",
	danger: "border-l-danger bg-danger-soft text-danger-ink",
	neutral: "border-l-neutral bg-neutral-soft text-neutral-ink",
};
