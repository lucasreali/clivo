import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import {
	getDayPanelQueryOptions,
	useListScheduleBlocks,
} from "#/api/gen/hooks";
import type { AppointmentView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import {
	dayMonthLabel,
	shiftDays,
	startOfWeek,
	today,
	weekdayLabel,
} from "#/shared/format/date";
import { Button } from "#/shared/ui/Button";
import { Panel } from "#/shared/ui/Panel";
import { describeStatus } from "../model/appointment-status";
import { appointmentAt, blockAt, daysOfWeek, slotsOfDay } from "../model/week";
import { NewAppointmentDialog } from "./NewAppointmentDialog";

const SLOTS = slotsOfDay();

export function WeekAgenda() {
	const [monday, setMonday] = useState(startOfWeek(today()));
	const [creating, setCreating] = useState(false);

	const days = daysOfWeek(monday);
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

	return (
		<>
			<TopBar
				title="Agenda"
				meta={`Semana de ${dayMonthLabel(monday)} a ${dayMonthLabel(shiftDays(monday, 5))}`}
				actions={
					<>
						<Button
							variant="secondary"
							onClick={() => setMonday(shiftDays(monday, -7))}
						>
							‹
						</Button>
						<Button
							variant="secondary"
							onClick={() => setMonday(startOfWeek(today()))}
						>
							Semana atual
						</Button>
						<Button
							variant="secondary"
							onClick={() => setMonday(shiftDays(monday, 7))}
						>
							›
						</Button>
						<Button onClick={() => setCreating(true)}>
							+ Novo agendamento
						</Button>
					</>
				}
			/>

			<Page>
				<Panel className="overflow-hidden">
					<div className="grid grid-cols-[68px_repeat(6,1fr)] border-b border-line bg-surface">
						<span />
						{days.map((day) => (
							<span
								key={day}
								className="flex flex-col items-center gap-0.5 border-l border-line py-2"
							>
								<span className="text-[11.5px] text-muted uppercase">
									{weekdayLabel(day)}
								</span>
								<span className="text-[13px] font-semibold text-ink">
									{dayMonthLabel(day)}
								</span>
							</span>
						))}
					</div>

					{SLOTS.map((slot) => (
						<div
							key={slot}
							className="grid grid-cols-[68px_repeat(6,1fr)] border-b border-line last:border-b-0"
						>
							<span className="px-2 py-1.5 text-right text-[11.5px] text-faint">
								{slot}
							</span>
							{days.map((day) => (
								<AgendaCell
									key={`${day}-${slot}`}
									appointment={appointmentAt(appointments, day, slot)}
									blocked={Boolean(blockAt(blocks.data ?? [], day, slot))}
								/>
							))}
						</div>
					))}
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
	blocked: boolean;
};

function AgendaCell({ appointment, blocked }: AgendaCellProps) {
	if (appointment) {
		return <AgendaAppointment appointment={appointment} />;
	}

	return (
		<div
			className={`min-h-[34px] border-l border-line ${blocked ? "bg-neutral-soft" : ""}`}
		/>
	);
}

function AgendaAppointment({ appointment }: { appointment: AppointmentView }) {
	const status = describeStatus(appointment.status);

	return (
		<div className="min-h-[34px] border-l border-line p-0.5">
			<div className="flex h-full flex-col rounded-[6px] bg-brand-soft px-1.5 py-1">
				<span className="truncate text-[11.5px] font-semibold text-brand-ink">
					{appointment.customerName}
				</span>
				<span className="truncate text-[10.5px] text-muted">
					{appointment.serviceName ?? status.label}
				</span>
			</div>
		</div>
	);
}
