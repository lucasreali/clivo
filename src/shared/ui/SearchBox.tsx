import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "./cn";

type SearchBoxProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	label: string;
};

/** A name filter over a listing the screen already holds; it never calls the API. */
export function SearchBox({
	value,
	onChange,
	placeholder,
	label,
}: SearchBoxProps) {
	return (
		<div
			className={cn(
				"flex h-9 max-w-[340px] flex-1 items-center gap-2 rounded-field border bg-panel px-3",
				value ? "border-brand" : "border-line",
			)}
		>
			<MagnifyingGlass
				size={14}
				className={cn("shrink-0", value ? "text-brand" : "text-faint")}
				aria-hidden="true"
			/>
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				aria-label={label}
				className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none"
			/>
			{value ? (
				<button
					type="button"
					onClick={() => onChange("")}
					aria-label="Limpar busca"
					className="text-faint hover:text-ink"
				>
					<X size={14} aria-hidden="true" />
				</button>
			) : null}
		</div>
	);
}

type SituationFilterProps = {
	options: readonly { label: string; value: string }[];
	value: string;
	onChange: (value: string) => void;
};

const FILTER =
	"flex h-9 items-center rounded-field px-3.5 text-[13px] whitespace-nowrap";

/** The row of toggles beside a `SearchBox` that narrows a listing by status. */
export function SituationFilter({
	options,
	value,
	onChange,
}: SituationFilterProps) {
	return options.map((option) => (
		<button
			key={option.label}
			type="button"
			onClick={() => onChange(option.value)}
			aria-pressed={value === option.value}
			className={cn(
				FILTER,
				value === option.value
					? "bg-brand font-semibold text-white"
					: "border border-line bg-panel text-muted hover:border-brand hover:text-brand-ink",
			)}
		>
			{option.label}
		</button>
	));
}
