import type { ComponentRegion, MarkedRegionState } from "#/api/gen/types";
import { cn } from "#/shared/ui/cn";
import type { Chart, Spot, Vocabulary } from "../../model/chart";

/**
 * A region is drawn as a cross of cells: the first four parts take the arms in
 * the order the descriptor lists them and a fifth takes the centre. Mirrored
 * rows swap the outer and inner arms so the same anatomical side of the region
 * stays on the same side of the drawing.
 */
const RING = ["left", "right", "top", "bottom", "center"] as const;
const MIRRORED = ["left", "right", "bottom", "top", "center"] as const;

const ARMS: Record<(typeof RING)[number], string> = {
	top: "col-start-2 row-start-1",
	left: "col-start-1 row-start-2",
	center: "col-start-2 row-start-2",
	right: "col-start-3 row-start-2",
	bottom: "col-start-2 row-start-3",
};

const CELL = "h-full w-full border";

/** The arms are half the thickness of the centre and share its edges. */
const CROSS = "grid grid-cols-[8px_16px_8px] grid-rows-[8px_16px_8px] p-[2px]";
const STRIP = "flex gap-[2px] p-[2px]";
const LOOSE_ARM = "h-[10px] w-[10px]";

type RegionChartProps = {
	chart: Chart;
	vocabulary: Vocabulary;
	spots: readonly Spot[];
	onSelect: (region: string, part: string | undefined) => void;
};

export function RegionChart({
	chart,
	vocabulary,
	spots,
	onSelect,
}: RegionChartProps) {
	return (
		<div className="flex flex-col gap-5 rounded-field bg-surface px-4 py-5">
			{chart.rows().map((regions, row) => (
				<div
					key={codesOf(regions)}
					className="flex flex-wrap justify-center gap-2"
				>
					{regions.map((region) => (
						<RegionCell
							key={region.code}
							region={region}
							states={chart.statesOf(region.code)}
							vocabulary={vocabulary}
							spots={spots.filter((spot) => spot.region === region.code)}
							onSelect={onSelect}
							mirrored={row % 2 === 1}
						/>
					))}
				</div>
			))}
		</div>
	);
}

type RegionCellProps = {
	region: ComponentRegion;
	states: readonly MarkedRegionState[];
	vocabulary: Vocabulary;
	spots: readonly Spot[];
	mirrored: boolean;
	onSelect: (region: string, part: string | undefined) => void;
};

function RegionCell({
	region,
	states,
	vocabulary,
	spots,
	mirrored,
	onSelect,
}: RegionCellProps) {
	const parts = region.parts ?? [];
	const whole = states.find((state) => state.part === undefined);

	return (
		<div className="flex flex-col items-center gap-1.5">
			<div className={cn(parts.length > RING.length ? STRIP : CROSS)}>
				{parts.length === 0 ? (
					<Arm
						place="col-span-3 row-span-3"
						label={nameOf(region, undefined, states, vocabulary)}
						state={whole}
						current={spots.length > 0}
						vocabulary={vocabulary}
						onClick={() => onSelect(region.code ?? "", undefined)}
					/>
				) : null}

				{parts.map((part, index) => (
					<Arm
						key={part}
						place={placeOf(index, parts.length, mirrored)}
						label={nameOf(region, part, states, vocabulary)}
						state={states.find((marked) => marked.part === part) ?? whole}
						current={spots.some((spot) => spot.part === part)}
						vocabulary={vocabulary}
						onClick={() => onSelect(region.code ?? "", part)}
					/>
				))}
			</div>
			<span className="text-[10px] leading-none text-faint">
				{region.label ?? region.code}
			</span>
		</div>
	);
}

type ArmProps = {
	place: string;
	label: string;
	state: MarkedRegionState | undefined;
	current: boolean;
	vocabulary: Vocabulary;
	onClick: () => void;
};

function Arm({ place, label, state, current, vocabulary, onClick }: ArmProps) {
	const painted = state
		? {
				backgroundColor: faded(vocabulary.colorOf(state.mark)),
				borderColor: vocabulary.colorOf(state.mark),
			}
		: undefined;

	return (
		<button
			type="button"
			aria-label={label}
			aria-pressed={current}
			onClick={onClick}
			style={painted}
			className={cn(
				CELL,
				place,
				current && "ring-1 ring-brand ring-inset",
				markedClass(state, current),
			)}
		/>
	);
}

/** The border carries the condition's colour; the fill only hints at it. */
function faded(color: string) {
	return /^#[0-9a-f]{6}$/i.test(color) ? `${color}38` : color;
}

function markedClass(state: MarkedRegionState | undefined, current: boolean) {
	if (state) {
		return state.origin?.source === "HISTORY" ? "opacity-60" : null;
	}
	return current
		? "border-brand bg-brand-soft"
		: "border-line bg-panel hover:border-brand";
}

function placeOf(index: number, total: number, mirrored: boolean) {
	if (total > RING.length) {
		return LOOSE_ARM;
	}
	return ARMS[(mirrored ? MIRRORED : RING)[index]];
}

function nameOf(
	region: ComponentRegion,
	part: string | undefined,
	states: readonly MarkedRegionState[],
	vocabulary: Vocabulary,
) {
	const place = [region.label ?? region.code, part].filter(Boolean).join(" ");
	const state = states.find((marked) => marked.part === part);
	return `${place}: ${state ? vocabulary.labelOf(state.mark) : "sem marcação"}`;
}

function codesOf(regions: readonly ComponentRegion[]) {
	return regions.map((region) => region.code).join("-");
}
