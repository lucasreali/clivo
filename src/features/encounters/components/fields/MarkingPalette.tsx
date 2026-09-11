import { cn } from "#/shared/ui/cn";
import type { Vocabulary } from "../../model/chart";

type MarkingPaletteProps = {
	vocabulary: Vocabulary;
	active: string | undefined;
	hint: string;
	disabled: boolean;
	onPick: (code: string) => void;
};

export function MarkingPalette({
	vocabulary,
	active,
	hint,
	disabled,
	onPick,
}: MarkingPaletteProps) {
	return (
		<div className="flex flex-col gap-2 rounded-field border border-line bg-panel p-3">
			<div className="flex flex-wrap items-center gap-1.5">
				{vocabulary.map((mark) => (
					<button
						key={mark.code}
						type="button"
						disabled={disabled}
						aria-pressed={mark.code === active}
						onClick={() => onPick(mark.code ?? "")}
						className={cn(
							"inline-flex h-7 items-center gap-1.5 rounded-field border px-2.5 text-[12px] disabled:text-faint",
							mark.code === active
								? "border-brand bg-brand-soft text-brand-ink"
								: "border-line bg-panel text-muted hover:border-line-strong",
						)}
					>
						<span
							className="h-2.5 w-2.5 rounded-[2px]"
							style={{ backgroundColor: vocabulary.colorOf(mark.code) }}
						/>
						{mark.label}
					</button>
				))}
			</div>
			<span className="text-[11.5px] text-faint">{hint}</span>
		</div>
	);
}
