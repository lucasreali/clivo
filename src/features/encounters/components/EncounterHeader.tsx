import { Paperclip } from "@phosphor-icons/react";
import type { EncounterView } from "#/api/gen/types";
import { ageLabel, dateTimeLabel } from "#/shared/format/date";
import { Avatar } from "#/shared/ui/Avatar";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { announcePending } from "#/shared/ui/pending";

type EncounterHeaderProps = {
	encounter: EncounterView;
	open: boolean;
};

export function EncounterHeader({ encounter, open }: EncounterHeaderProps) {
	const customer = encounter.customer;
	const practitioner = encounter.practitioner;

	return (
		<header className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-field border border-line bg-panel px-4 py-3.5">
			<div className="flex items-center gap-3">
				<Avatar name={customer?.name ?? "?"} size="md" />
				<div className="flex flex-col">
					<span className="text-[14px] font-semibold text-ink">
						{[customer?.name, ageLabel(customer?.birthDate)]
							.filter(Boolean)
							.join(" · ")}
					</span>
					<span className="text-[12px] text-muted">
						{customer?.coverage?.plan ?? "Particular"}
						<Alerts notes={notesOf(encounter)} />
					</span>
				</div>
			</div>

			<Detail label="Data" value={dateTimeLabel(encounter.startedAt)} />
			<Detail
				label="Profissional"
				value={[practitioner?.name, practitioner?.license]
					.filter(Boolean)
					.join(" · ")}
			/>
			<Detail label="Serviço" value={encounter.service?.name} />

			<div className="ml-auto flex items-center gap-3">
				<Badge tone={open ? "brand" : "neutral"}>
					{open ? "Em atendimento" : "Concluído"}
				</Badge>
				<Button
					variant="secondary"
					onClick={() => announcePending("O anexo de imagens à ficha")}
				>
					<Paperclip size={14} aria-hidden="true" />
					Anexar imagem
				</Button>
			</div>
		</header>
	);
}

type DetailProps = {
	label: string;
	value: string | undefined;
};

function Detail({ label, value }: DetailProps) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-[11px] text-faint">{label}</span>
			<span className="text-[12.5px] text-ink">{value || "—"}</span>
		</div>
	);
}

function Alerts({ notes }: { notes: string[] }) {
	if (notes.length === 0) {
		return null;
	}
	return <span className="text-danger"> · {notes.join(" · ")}</span>;
}

function notesOf(encounter: EncounterView) {
	return (encounter.customer?.alerts ?? [])
		.map((alert) => alert.note)
		.filter((note): note is string => Boolean(note));
}
