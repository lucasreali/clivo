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
import { ChartLegend } from "./ChartLegend";
import { MarkingEditor } from "./MarkingEditor";
import { MarkingList } from "./MarkingList";
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

	const vocabulary = Vocabulary.of(field.descriptor);
	const markings = Markings.of(value);
	const recorded = (field.markings ?? []).filter(
		(state) => state.origin?.source !== "SESSION",
	);
	const session = sessionStatesOf(markings.list());
	const chart = Chart.of(field.descriptor, [...recorded, ...session]);

	function touch(region: string, part: string | undefined) {
		setSpots(
			spots.some((spot) => isSame(spot, region, part))
				? spots.filter((spot) => !isSame(spot, region, part))
				: [...spots, { region, part }],
		);
	}

	function paint(code: string) {
		onChange(
			markings.marks(spots, code)
				? markings.cleared(spots)
				: markings.painting(spots, code, vocabulary.refusesParts(code)),
		);
		setSpots([]);
	}

	function remove() {
		onChange(markings.cleared(spots));
		setSpots([]);
	}

	return (
		<div className="flex flex-col gap-4">
			<RegionChart
				chart={chart}
				vocabulary={vocabulary}
				spots={spots}
				onSelect={touch}
			/>

			{spots.length > 0 ? (
				<MarkingEditor
					place={placeOf(chart, spots)}
					marking={markings.shared(spots)}
					vocabulary={vocabulary}
					disabled={disabled}
					onMark={paint}
					onNote={(note) => onChange(markings.annotated(spots, note))}
					onRemove={remove}
					onClose={() => setSpots([])}
				/>
			) : null}

			<div className="grid grid-cols-[minmax(0,1fr)_auto] gap-8">
				<section className="flex flex-col gap-2">
					<span className="text-[12px] font-medium text-muted">
						Marcações desta sessão
					</span>
					<MarkingList
						entries={entriesOf([...session, ...recorded])}
						vocabulary={vocabulary}
						onSelect={(region, part) => setSpots([{ region, part }])}
					/>
				</section>
				<section className="flex flex-col gap-2">
					<span className="text-[12px] font-medium text-muted">
						Legenda de condições
					</span>
					<ChartLegend vocabulary={vocabulary} />
				</section>
			</div>
		</div>
	);
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
