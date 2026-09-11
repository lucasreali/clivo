import { X } from "@phosphor-icons/react";
import type { RegionMarking } from "#/api/gen/types";
import { Button } from "#/shared/ui/Button";
import { TextInput } from "#/shared/ui/Field";

const NOTE_LIMIT = 400;

type MarkingEditorProps = {
	place: string;
	marking: RegionMarking | undefined;
	disabled: boolean;
	onNote: (note: string) => void;
	onRemove: () => void;
	onClose: () => void;
};

export function MarkingEditor({
	place,
	marking,
	disabled,
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
