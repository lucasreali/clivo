import { useCompareEncounterRecord } from "#/api/gen/hooks";
import type {
	FieldComparisonView,
	MarkingChangeView,
	RecordSheet,
} from "#/api/gen/types";
import { messageOf } from "#/shared/api-error";
import { shortDate } from "#/shared/format/date";
import { Badge } from "#/shared/ui/Badge";
import { Callout } from "#/shared/ui/Callout";
import { Drawer } from "#/shared/ui/Drawer";
import { EmptyState } from "#/shared/ui/EmptyState";
import type { Tone } from "#/shared/ui/tone";
import { Vocabulary } from "../model/chart";
import { fieldsOf } from "../model/record-values";

const CHANGES: Record<string, { label: string; tone: Tone }> = {
	ADDED: { label: "Marked", tone: "brand" },
	REMOVED: { label: "Removed", tone: "neutral" },
	CHANGED: { label: "Changed", tone: "warn" },
};

type RecordComparisonProps = {
	encounterId: string;
	asOf: string;
	sheet: RecordSheet | undefined;
	onClose: () => void;
};

export function RecordComparison({
	encounterId,
	asOf,
	sheet,
	onClose,
}: RecordComparisonProps) {
	const comparison = useCompareEncounterRecord({
		path: { id: encounterId },
		query: { asOf },
	});

	const fields = comparison.data?.fields ?? [];

	return (
		<Drawer
			title="Compare with previous encounter"
			subtitle={`State recorded on ${shortDate(asOf)}`}
			onClose={onClose}
			width="max-w-[480px]"
		>
			{comparison.isError ? (
				<Callout tone="danger">{messageOf(comparison.error)}</Callout>
			) : null}

			{comparison.isPending ? (
				<span className="text-[12.5px] text-muted">Loading comparison…</span>
			) : null}

			{fields.every((field) => (field.changes ?? []).length === 0) &&
			!comparison.isPending ? (
				<EmptyState
					title="No changes"
					description="The recorded conditions are the same as on the compared date."
				/>
			) : null}

			<div className="flex flex-col gap-5">
				{fields
					.filter((field) => (field.changes ?? []).length > 0)
					.map((field) => (
						<FieldChanges key={field.fieldCode} field={field} sheet={sheet} />
					))}
			</div>
		</Drawer>
	);
}

type FieldChangesProps = {
	field: FieldComparisonView;
	sheet: RecordSheet | undefined;
};

function FieldChanges({ field, sheet }: FieldChangesProps) {
	const described = fieldsOf(sheet).find(
		(candidate) => candidate.code === field.fieldCode,
	);
	const vocabulary = Vocabulary.of(described?.descriptor);

	return (
		<section className="flex flex-col gap-2">
			<span className="text-[12px] font-medium text-muted">
				{described?.label ?? field.fieldCode}
			</span>
			<ul className="m-0 flex list-none flex-col gap-1.5 p-0">
				{(field.changes ?? []).map((change) => (
					<li
						key={`${change.region}-${change.part}`}
						className="flex items-center gap-2.5 text-[12.5px]"
					>
						<span className="w-6 shrink-0 font-semibold text-ink">
							{change.region}
						</span>
						<Badge tone={kindOf(change).tone} withDot={false}>
							{kindOf(change).label}
						</Badge>
						<span className="min-w-0 flex-1 truncate text-muted">
							{transition(change, vocabulary)}
						</span>
						<span className="shrink-0 text-[11.5px] text-faint">
							{change.part ?? "whole region"}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}

function kindOf(change: MarkingChangeView) {
	return (
		CHANGES[change.change ?? ""] ?? { label: change.change ?? "", tone: "info" }
	);
}

function transition(change: MarkingChangeView, vocabulary: Vocabulary) {
	return [change.from?.mark, change.to?.mark]
		.filter(Boolean)
		.map((mark) => vocabulary.labelOf(mark))
		.join(" → ");
}
