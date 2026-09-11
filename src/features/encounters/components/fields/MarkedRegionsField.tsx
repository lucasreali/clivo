import { useState } from "react";
import type { RegionMarking, SheetField } from "#/api/gen/types";
import {
	Chart,
	entriesOf,
	Markings,
	type Spot,
	sessionStatesOf,
	Vocabulary,
} from "../../model/chart";
import { MarkingEditor } from "./MarkingEditor";
import { MarkingList } from "./MarkingList";
import { MarkingPalette } from "./MarkingPalette";
import { RegionChart } from "./RegionChart";

type MarkedRegionsFieldProps = {
	field: SheetField;
	value: unknown;
	disabled: boolean;
	onChange: (markings: RegionMarking[]) => void;
};

/**
 * Variability mechanism B: the region drawing, the parts it accepts and the
 * conditions it offers all arrive in the field's descriptor, so the same
 * component serves a dental chart, a body map or whatever the API describes.
 */
export function MarkedRegionsField({
	field,
	value,
	disabled,
	onChange,
}: MarkedRegionsFieldProps) {
	const [spots, setSpots] = useState<Spot[]>([]);
	const [brush, setBrush] = useState<string>();

	const vocabulary = Vocabulary.of(field.descriptor);
	const markings = Markings.of(value);
	const recorded = (field.markings ?? []).filter(
		(state) => state.origin?.source !== "SESSION",
	);
	const session = sessionStatesOf(markings.list());
	const chart = Chart.of(field.descriptor, [...recorded, ...session]);
	const selected = markings.shared(spots);

	function touch(region: string, part: string | undefined) {
		if (brush && spots.length === 0) {
			paint([{ region, part }], brush);
			return;
		}
		setSpots(
			spots.some((spot) => isSame(spot, region, part))
				? spots.filter((spot) => !isSame(spot, region, part))
				: [...spots, { region, part }],
		);
	}

	function pick(code: string) {
		if (spots.length === 0) {
			setBrush(brush === code ? undefined : code);
			return;
		}
		paint(spots, code);
		setSpots([]);
	}

	function paint(targets: readonly Spot[], code: string) {
		onChange(
			markings.marks(targets, code)
				? markings.cleared(targets)
				: markings.painting(targets, code, vocabulary.refusesParts(code)),
		);
	}

	function remove() {
		onChange(markings.cleared(spots));
		setSpots([]);
	}

	return (
		<div className="flex flex-col gap-4">
			<MarkingPalette
				vocabulary={vocabulary}
				active={spots.length > 0 ? selected?.mark : brush}
				hint={hintOf(vocabulary, spots, brush)}
				disabled={disabled}
				onPick={pick}
			/>

			<RegionChart
				chart={chart}
				vocabulary={vocabulary}
				spots={spots}
				onSelect={touch}
			/>

			{spots.length > 0 ? (
				<MarkingEditor
					place={placeOf(chart, spots)}
					marking={selected}
					disabled={disabled}
					onNote={(note) => onChange(markings.annotated(spots, note))}
					onRemove={remove}
					onClose={() => setSpots([])}
				/>
			) : null}

			<section className="flex flex-col gap-2">
				<span className="text-[12px] font-medium text-muted">
					Markings from this session
				</span>
				<MarkingList
					entries={entriesOf([...session, ...recorded])}
					vocabulary={vocabulary}
					onSelect={(region, part) => setSpots([{ region, part }])}
				/>
			</section>
		</div>
	);
}

function hintOf(
	vocabulary: Vocabulary,
	spots: readonly Spot[],
	brush: string | undefined,
) {
	if (spots.length > 0) {
		return "Choose the condition to apply to the selected area.";
	}
	if (brush) {
		return `${vocabulary.labelOf(brush)}: click the areas on the drawing to mark them, click again to unmark.`;
	}
	return "Choose a condition and click the drawing to mark it, or select areas first to annotate and remove.";
}

function placeOf(chart: Chart, spots: readonly Spot[]) {
	const regions = new Map<string, string[]>();
	for (const spot of spots) {
		const named = chart.regionNamed(spot.region);
		const label = named?.label ?? spot.region;
		regions.set(
			label,
			spot.part ? [...(regions.get(label) ?? []), spot.part] : [],
		);
	}
	return [...regions]
		.map(([region, parts]) => [region, ...parts].join(" · "))
		.join("   ");
}

function isSame(spot: Spot, region: string, part: string | undefined) {
	return spot.region === region && spot.part === part;
}
