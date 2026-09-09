import { X } from "@phosphor-icons/react";
import type { RegionMarking } from "#/api/gen/types";
import { Button } from "#/shared/ui/Button";
import { cn } from "#/shared/ui/cn";
import { TextInput } from "#/shared/ui/Field";
import type { Vocabulary } from "../../model/chart";

const NOTE_LIMIT = 400;

type MarkingEditorProps = {
	place: string;
	marking: RegionMarking | undefined;
	vocabulary: Vocabulary;
	disabled: boolean;
	onMark: (code: string) => void;
	onNote: (note: string) => void;
	onRemove: () => void;
	onClose: () => void;
};

export function MarkingEditor({
	place,
	marking,
	vocabulary,
	disabled,
	onMark,
	onNote,
	onRemove,
	onClose,
}: MarkingEditorProps) {
	return (
		<div className="flex flex-col gap-3 rounded-field border border-line bg-panel p-4">
			<header className="flex items-center justify-between gap-3">
				<span className="text-[13px] font-semibold text-ink">{place}</span>
				<button
					type="button"
					aria-label="Fechar marcação"
					onClick={onClose}
					className="text-faint hover:text-ink"
				>
					<X size={14} aria-hidden="true" />
				</button>
			</header>

			<div className="flex flex-wrap gap-1.5">
				{vocabulary.map((mark) => (
					<button
						key={mark.code}
						type="button"
						disabled={disabled}
						aria-pressed={mark.code === marking?.mark}
						onClick={() => onMark(mark.code ?? "")}
						className={cn(
							"inline-flex h-7 items-center gap-1.5 rounded-field border px-2.5 text-[12px] disabled:text-faint",
							mark.code === marking?.mark
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

			{marking ? (
				<div className="flex items-center gap-2">
					<TextInput
						value={marking.note ?? ""}
						disabled={disabled}
						maxLength={NOTE_LIMIT}
						placeholder="Anotação desta marcação"
						onChange={(event) => onNote(event.target.value)}
					/>
					<Button variant="ghost" disabled={disabled} onClick={onRemove}>
						Remover
					</Button>
				</div>
			) : null}
		</div>
	);
}
