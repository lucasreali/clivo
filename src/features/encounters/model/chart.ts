import type {
	ComponentDescriptor,
	ComponentMark,
	ComponentRegion,
	MarkedRegionState,
	MarkingOrigin,
	RegionMarking,
} from "#/api/gen/types";

export class Vocabulary {
	private constructor(private readonly marks: readonly ComponentMark[]) {}

	static of(descriptor: ComponentDescriptor | undefined) {
		return new Vocabulary(descriptor?.vocabulary ?? []);
	}

	map<T>(project: (mark: ComponentMark) => T) {
		return this.marks.map(project);
	}

	labelOf(code: string | undefined) {
		return this.named(code)?.label ?? code ?? "";
	}

	colorOf(code: string | undefined) {
		return this.named(code)?.rendering ?? "var(--color-neutral)";
	}

	demandsParts(code: string | undefined) {
		return this.named(code)?.appliesTo === "PART";
	}

	refusesParts(code: string | undefined) {
		return this.named(code)?.appliesTo === "REGION";
	}

	accepts(code: string | undefined, parts: readonly string[]) {
		if (this.demandsParts(code)) {
			return parts.length > 0;
		}
		return !this.refusesParts(code) || parts.length === 0;
	}

	private named(code: string | undefined) {
		return this.marks.find((mark) => mark.code === code);
	}
}

export class Chart {
	private constructor(
		private readonly regions: readonly ComponentRegion[],
		private readonly groupings: readonly string[],
		private readonly states: readonly MarkedRegionState[],
	) {}

	static of(
		descriptor: ComponentDescriptor | undefined,
		states: readonly MarkedRegionState[] | undefined,
	) {
		return new Chart(
			descriptor?.regions ?? [],
			descriptor?.groupings ?? [],
			states ?? [],
		);
	}

	rows() {
		const [rowKey, halfKey] = this.groupings;
		if (!rowKey) {
			return [this.ordered(this.regions)];
		}
		return this.valuesOf(this.regions, rowKey).map((value, index) =>
			this.laidOut(this.matching(this.regions, rowKey, value), halfKey, index),
		);
	}

	regionNamed(code: string | undefined) {
		return this.regions.find((region) => region.code === code);
	}

	statesOf(code: string | undefined) {
		return this.states.filter((state) => state.region === code);
	}

	recorded() {
		return this.states;
	}

	/**
	 * An anatomical chart mirrors around the midline: the halves of a row grow
	 * outwards from the centre, and each row mirrors the one above it, so the
	 * same side of the body stays on the same side of the drawing.
	 */
	private laidOut(
		members: readonly ComponentRegion[],
		halfKey: string | undefined,
		index: number,
	) {
		if (!halfKey) {
			return this.ordered(members);
		}
		const halves = this.valuesOf(members, halfKey).sort();
		return this.mirrored(halves, index).flatMap((value, half) =>
			this.outwards(this.matching(members, halfKey, value), half),
		);
	}

	private mirrored(halves: string[], index: number) {
		return index % 2 === 0 ? halves : [...halves].reverse();
	}

	private outwards(members: readonly ComponentRegion[], half: number) {
		const ordered = this.ordered(members);
		return half === 0 ? [...ordered].reverse() : ordered;
	}

	private ordered(members: readonly ComponentRegion[]) {
		return [...members].sort(
			(one, other) => (one.position ?? 0) - (other.position ?? 0),
		);
	}

	private matching(
		members: readonly ComponentRegion[],
		key: string,
		value: string,
	) {
		return members.filter((region) => region.groups?.[key] === value);
	}

	private valuesOf(members: readonly ComponentRegion[], key: string) {
		return [
			...new Set(
				members.map((region) => region.groups?.[key]).filter(isPresent),
			),
		];
	}
}

export type Spot = {
	region: string;
	part: string | undefined;
};

export class Markings {
	private constructor(private readonly items: readonly RegionMarking[]) {}

	static of(value: unknown) {
		return new Markings(Array.isArray(value) ? (value as RegionMarking[]) : []);
	}

	list() {
		return this.items;
	}

	on(region: string | undefined) {
		return this.items.filter((marking) => marking.region === region);
	}

	at(region: string | undefined, part: string | undefined) {
		return this.on(region).find((marking) => marking && touches(marking, part));
	}

	shared(spots: readonly Spot[]) {
		const first = spots[0] && this.at(spots[0].region, spots[0].part);
		return first && this.marks(spots, first.mark ?? "") ? first : undefined;
	}

	marks(spots: readonly Spot[], code: string) {
		return (
			spots.length > 0 &&
			spots.every((spot) => this.at(spot.region, spot.part)?.mark === code)
		);
	}

	painting(spots: readonly Spot[], code: string, whole: boolean) {
		return [...groupsOf(spots)].reduce(
			(items: RegionMarking[], [region, parts]) =>
				new Markings(items).with({
					region,
					mark: code,
					parts: whole ? [] : parts,
					note: this.at(region, parts[0])?.note ?? "",
				}),
			[...this.items],
		);
	}

	annotated(spots: readonly Spot[], note: string) {
		return this.items.map((marking) =>
			reaches(marking, spots) ? { ...marking, note } : marking,
		);
	}

	cleared(spots: readonly Spot[]) {
		return this.items.filter((marking) => !reaches(marking, spots));
	}

	with(marking: RegionMarking) {
		return [...this.clearing(marking), marking];
	}

	without(marking: RegionMarking) {
		return this.items.filter((item) => item !== marking);
	}

	private clearing(marking: RegionMarking) {
		return this.items.filter((item) => !overlap(item, marking));
	}
}

function overlap(one: RegionMarking, other: RegionMarking) {
	if (one.region !== other.region) {
		return false;
	}
	return coveredParts(one).length === 0 || coveredParts(other).length === 0
		? true
		: coveredParts(one).some((part) => coveredParts(other).includes(part));
}

function reaches(marking: RegionMarking, spots: readonly Spot[]) {
	return spots.some(
		(spot) => marking.region === spot.region && touches(marking, spot.part),
	);
}

function touches(marking: RegionMarking, part: string | undefined) {
	return (
		coveredParts(marking).length === 0 ||
		part === undefined ||
		coveredParts(marking).includes(part)
	);
}

function groupsOf(spots: readonly Spot[]) {
	const groups = new Map<string, string[]>();
	for (const spot of spots) {
		const parts = groups.get(spot.region) ?? [];
		groups.set(spot.region, spot.part ? [...parts, spot.part] : parts);
	}
	return groups;
}

function coveredParts(marking: RegionMarking) {
	return marking.parts ?? [];
}

function isPresent(value: string | undefined): value is string {
	return value !== undefined;
}

export type ChartEntry = {
	region: string;
	mark: string;
	note: string | undefined;
	parts: string[];
	origin: MarkingOrigin | undefined;
};

/**
 * The API reports one state per marked part; a condition the practitioner wrote
 * once over several parts is read back as one entry again.
 */
export function entriesOf(states: readonly MarkedRegionState[]): ChartEntry[] {
	const entries = new Map<string, ChartEntry>();
	for (const state of states) {
		const key = keyOf(state);
		const entry = entries.get(key) ?? blankEntry(state);
		entries.set(key, {
			...entry,
			parts: state.part ? [...entry.parts, state.part] : entry.parts,
		});
	}
	return [...entries.values()];
}

function keyOf(state: MarkedRegionState) {
	return [
		state.region,
		state.mark,
		state.note,
		state.origin?.encounterId,
		state.origin?.recordedAt,
	].join("|");
}

function blankEntry(state: MarkedRegionState): ChartEntry {
	return {
		region: state.region ?? "",
		mark: state.mark ?? "",
		note: state.note,
		parts: [],
		origin: state.origin,
	};
}

/**
 * The markings being written in this session, in the per-part shape the API
 * reports, so the drawing shows an edit before it is saved.
 */
export function sessionStatesOf(
	markings: readonly RegionMarking[],
): MarkedRegionState[] {
	return markings.flatMap((marking) =>
		partsOrWhole(marking).map((part) => ({
			region: marking.region,
			part,
			mark: marking.mark,
			note: marking.note,
			origin: { source: "SESSION" as const },
		})),
	);
}

function partsOrWhole(marking: RegionMarking) {
	return marking.parts?.length ? marking.parts : [undefined];
}
