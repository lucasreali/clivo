export type Option = {
	value: string;
	label: string;
	hint?: string;
};

/** The popup shared by Select and Combobox, so a list of options looks the same either way. */
export const OPTION_POPUP =
	"max-h-[min(220px,var(--available-height))] overflow-y-auto rounded-field border border-line bg-panel p-1 shadow-[0_12px_28px_rgba(44,44,42,0.14)] outline-none";

export const OPTION_ITEM =
	"flex cursor-pointer flex-col items-start gap-0.5 rounded-[6px] px-2.5 py-2 text-[13px] text-ink outline-none select-none data-highlighted:bg-brand-soft data-highlighted:text-brand-ink";

export const OPTION_NOTICE = "px-2.5 py-2 text-[12.5px] text-muted";
