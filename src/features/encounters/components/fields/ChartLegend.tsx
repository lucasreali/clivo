import type { Vocabulary } from "../../model/chart";

type ChartLegendProps = {
	vocabulary: Vocabulary;
};

export function ChartLegend({ vocabulary }: ChartLegendProps) {
	return (
		<ul className="m-0 flex list-none flex-col gap-1.5 p-0">
			{vocabulary.map((mark) => (
				<li
					key={mark.code}
					className="flex items-center gap-2 text-[12px] text-muted"
				>
					<span
						className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
						style={{ backgroundColor: vocabulary.colorOf(mark.code) }}
					/>
					{mark.label}
				</li>
			))}
		</ul>
	);
}
