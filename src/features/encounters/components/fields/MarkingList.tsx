import { shortDate } from "#/shared/format/date";
import { EmptyState } from "#/shared/ui/EmptyState";
import type { ChartEntry, Vocabulary } from "../../model/chart";

type MarkingListProps = {
	entries: readonly ChartEntry[];
	vocabulary: Vocabulary;
	onSelect: (region: string, part: string | undefined) => void;
};

export function MarkingList({
	entries,
	vocabulary,
	onSelect,
}: MarkingListProps) {
	if (entries.length === 0) {
		return (
			<EmptyState
				title="Nenhuma condição marcada"
				description="Escolha um dente no desenho para registrar a condição observada."
			/>
		);
	}

	return (
		<ul className="m-0 flex list-none flex-col gap-1 p-0">
			{entries.map((entry) => (
				<li key={keyOf(entry)}>
					<button
						type="button"
						onClick={() => onSelect(entry.region, entry.parts[0])}
						className="flex w-full items-center gap-2.5 rounded-field px-2 py-1.5 text-left hover:bg-row-hover"
					>
						<span className="w-6 shrink-0 text-[12.5px] font-semibold text-ink">
							{entry.region}
						</span>
						<span
							className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
							style={{ backgroundColor: vocabulary.colorOf(entry.mark) }}
						/>
						<span className="flex min-w-0 flex-1 flex-col">
							<span className="truncate text-[12.5px] text-ink">
								{entry.note || vocabulary.labelOf(entry.mark)}
							</span>
							<span className="text-[11.5px] text-faint">{sinceOf(entry)}</span>
						</span>
						<span className="shrink-0 text-[11.5px] text-faint">
							{coverageOf(entry)}
						</span>
					</button>
				</li>
			))}
		</ul>
	);
}

function keyOf(entry: ChartEntry) {
	return `${entry.region}-${entry.mark}-${entry.parts.join("-")}`;
}

function coverageOf(entry: ChartEntry) {
	return entry.parts.length > 0 ? entry.parts.join(" · ") : "toda a região";
}

function sinceOf(entry: ChartEntry) {
	if (entry.origin?.source === "SESSION") {
		return "nesta sessão";
	}
	const since = entry.origin?.since ?? entry.origin?.recordedAt;
	return since ? `desde ${shortDate(since)}` : "registro anterior";
}
