import { useState } from "react";

type Chart = Record<string, string>;

type MarkedRegionsFieldProps = {
	label: string;
	regions: readonly string[];
	value: Chart;
	onChange: (chart: Chart) => void;
};

/**
 * Renders the odontogram and the body map: both arrive as a list of regions
 * plus a note per marked region, so one component serves either component field.
 */
export function MarkedRegionsField({
	label,
	regions,
	value,
	onChange,
}: MarkedRegionsFieldProps) {
	const [selected, setSelected] = useState<string | null>(null);

	function noteFor(region: string, note: string) {
		const chart = { ...value };
		if (note.trim() === "") {
			delete chart[region];
			onChange(chart);
			return;
		}

		chart[region] = note;
		onChange(chart);
	}

	return (
		<div className="flex flex-col gap-3">
			<span className="text-[12px] font-medium text-muted">{label}</span>

			<div className="flex flex-wrap gap-1.5">
				{regions.map((region) => (
					<button
						key={region}
						type="button"
						onClick={() => setSelected(region === selected ? null : region)}
						className={regionClass(region, value, selected)}
					>
						{region}
					</button>
				))}
			</div>

			{selected ? (
				<label className="flex flex-col gap-1.5">
					<span className="text-[12px] text-muted">
						Anotação para {selected}
					</span>
					<input
						value={value[selected] ?? ""}
						onChange={(event) => noteFor(selected, event.target.value)}
						placeholder="Ex.: cárie oclusal, restauração em resina"
						className="h-[38px] rounded-field border border-line bg-panel px-3 text-[13px] outline-none focus:border-brand"
					/>
				</label>
			) : null}

			{Object.entries(value).length > 0 ? (
				<ul className="m-0 flex list-none flex-col gap-1 p-0">
					{Object.entries(value).map(([region, note]) => (
						<li key={region} className="flex gap-2 text-[12.5px] text-muted">
							<span className="font-semibold text-ink">{region}</span>
							<span>{note}</span>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

function regionClass(region: string, chart: Chart, selected: string | null) {
	const base =
		"h-8 w-10 rounded-field border text-[12px] font-medium transition-colors";

	if (region === selected) {
		return `${base} border-brand bg-brand text-white`;
	}
	if (chart[region]) {
		return `${base} border-brand bg-brand-soft text-brand-ink`;
	}
	return `${base} border-line bg-panel text-muted hover:border-line-strong`;
}
