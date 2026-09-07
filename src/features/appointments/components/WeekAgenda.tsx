import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import {
	getDayPanelQueryOptions,
	useListPractitioners,
	useListScheduleBlocks,
} from "#/api/gen/hooks";
import type { AppointmentView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import {
	dayMonthLabel,
	shiftDays,
	startOfWeek,
	today,
	weekdayLabel,
} from "#/shared/format/date";
import { Button } from "#/shared/ui/Button";
import { cn } from "#/shared/ui/cn";
import { Panel } from "#/shared/ui/Panel";
import { Select } from "#/shared/ui/Select";
import { TONE_BLOCK, TONE_DOT, type Tone } from "#/shared/ui/tone";
import { describeStatus } from "../model/appointment-status";
import { appointmentAt, blockAt, daysOfWeek, slotsOfDay } from "../model/week";
import { NewAppointmentDialog } from "./NewAppointmentDialog";

const SLOTS = slotsOfDay();
const GRID = "grid-cols-[62px_repeat(6,1fr)]";

const LEGEND: { label: string; tone: Tone }[] = [
	{ label: "Confirmado", tone: "brand" },
	{ label: "Aguardando", tone: "warn" },
	{ label: "Na recepção", tone: "info" },
	{ label: "Falta", tone: "danger" },
];

export function WeekAgenda() {
	const [monday, setMonday] = useState(startOfWeek(today()));
	const [practitioner, setPractitioner] = useState("");
	const [creating, setCreating] = useState(false);

	const days = daysOfWeek(monday);
	const practitioners = useListPractitioners();
	const appointments = useQueries({
		queries: days.map((day) => getDayPanelQueryOptions({ query: { day } })),
		combine: (results) => results.flatMap((result) => result.data ?? []),
	});
	const blocks = useListScheduleBlocks({
		query: {
			from: `${monday}T00:00:00`,
			to: `${shiftDays(monday, 6)}T00:00:00`,
		},
	});

	const shown = appointments.filter(
		(appointment) =>
			!practitioner || String(appointment.practitionerId) === practitioner,
	);

	return (
		<>
			<AppTopBar
				title="Agenda"
				meta={`Semana de ${dayMonthLabel(monday)} a ${dayMonthLabel(shiftDays(monday, 5))}`}
				actions={
					<Button onClick={() => setCreating(true)}>+ Novo agendamento</Button>
				}
			/>

			<Page>
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2.5">
						<WeekPager monday={monday} onChange={setMonday} />
						<Select
							value={practitioner}
							onChange={setPractitioner}
							options={[
								{ value: "", label: "Todos os profissionais" },
								...(practitioners.data ?? []).map((item) => ({
									value: String(item.id),
									label: item.name ?? "Sem nome",
								})),
							]}
							aria-label="Filtrar por profissional"
							className="h-[34px] w-[220px] text-[13px]"
						/>
					</div>
					<div className="flex items-center gap-4 text-[12px] text-muted">
						{LEGEND.map((entry) => (
							<span key={entry.label} className="flex items-center gap-1.5">
								<span
									className={cn("h-2.5 w-2.5 rounded-sm", TONE_DOT[entry.tone])}
								/>
								{entry.label}
							</span>
						))}
						<span className="flex items-center gap-1.5">
							<span className="stripes h-2.5 w-2.5 rounded-sm" />
							Bloqueio / intervalo
						</span>
					</div>
				</div>

				<Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
					<div className={cn("grid border-b border-line bg-surface", GRID)}>
						<span className="border-r border-line" />
						{days.map((day) => (
							<span
								key={day}
								className="flex flex-col border-r border-line px-2.5 py-2 leading-tight last:border-r-0"
							>
								<span className="text-[12px] tracking-[0.4px] text-muted uppercase">
									{weekdayLabel(day)}
								</span>
								<span className="text-[13.5px] font-semibold text-ink">
									{dayMonthLabel(day)}
								</span>
							</span>
						))}
					</div>

					<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
						{SLOTS.map((slot) => (
							<div
								key={slot}
								className={cn(
									"grid min-h-[34px] flex-1 border-b border-line-soft last:border-b-0",
									GRID,
								)}
							>
								<span className="border-r border-line px-2 pt-0.5 text-right text-[11px] text-faint">
									{slot}
								</span>
								{days.map((day) => (
									<AgendaCell
										key={`${day}-${slot}`}
										appointment={appointmentAt(shown, day, slot)}
										isBlocked={Boolean(blockAt(blocks.data ?? [], day, slot))}
									/>
								))}
							</div>
						))}
					</div>
				</Panel>
			</Page>

			{creating ? (
				<NewAppointmentDialog day={monday} onClose={() => setCreating(false)} />
			) : null}
		</>
	);
}

type AgendaCellProps = {
	appointment: AppointmentView | undefined;
	isBlocked: boolean;
};

function AgendaCell({ appointment, isBlocked }: AgendaCellProps) {
	if (appointment) {
		return (
			<div className="border-r border-line-soft px-[3px] py-px last:border-r-0">
				<AgendaAppointment appointment={appointment} />
			</div>
		);
	}

	return (
		<div className="border-r border-line-soft px-[3px] py-px last:border-r-0">
			{isBlocked ? <div className="stripes h-full rounded-[3px]" /> : null}
		</div>
	);
}

function AgendaAppointment({ appointment }: { appointment: AppointmentView }) {
	const status = describeStatus(appointment.status);

	return (
		<div
			className={cn(
				"flex h-full flex-col justify-center overflow-hidden rounded-[4px] border-l-[3px] px-1.5 py-0.5 leading-[1.15]",
				TONE_BLOCK[status.tone],
			)}
		>
			<span className="truncate text-[11.5px] font-semibold">
				{appointment.customerName}
			</span>
			<span className="truncate text-[10.5px] opacity-85">
				{appointment.serviceName ?? status.label}
			</span>
		</div>
	);
}

type WeekPagerProps = {
	monday: string;
	onChange: (monday: string) => void;
};

function WeekPager({ monday, onChange }: WeekPagerProps) {
	return (
		<div className="flex h-[34px] items-center overflow-hidden rounded-field border border-line bg-panel">
			<button
				type="button"
				aria-label="Semana anterior"
				onClick={() => onChange(shiftDays(monday, -7))}
				className="h-full w-[34px] border-r border-line text-[14px] text-muted hover:text-ink"
			>
				‹
			</button>
			<button
				type="button"
				onClick={() => onChange(startOfWeek(today()))}
				className="h-full px-3.5 text-[13px] whitespace-nowrap text-ink"
			>
				{dayMonthLabel(monday)} – {dayMonthLabel(shiftDays(monday, 5))}
			</button>
			<button
				type="button"
				aria-label="Próxima semana"
				onClick={() => onChange(shiftDays(monday, 7))}
				className="h-full w-[34px] border-l border-line text-[14px] text-muted hover:text-ink"
			>
				›
			</button>
		</div>
	);
}
