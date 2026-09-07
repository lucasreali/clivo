import { useState } from "react";
import { useGetDayPanel, useListPractitioners } from "#/api/gen/hooks";
import type { AppointmentView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { dayLabel, shiftDays, today } from "#/shared/format/date";
import { Button } from "#/shared/ui/Button";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Select } from "#/shared/ui/Field";
import { Panel } from "#/shared/ui/Panel";
import { TONE_SURFACE } from "#/shared/ui/tone";
import { summarise } from "../model/day-summary";
import { AppointmentRow } from "./AppointmentRow";
import { CancelAppointmentDialog } from "./CancelAppointmentDialog";
import { NewAppointmentDialog } from "./NewAppointmentDialog";
import { RescheduleAppointmentDialog } from "./RescheduleAppointmentDialog";

type Dialog =
	| { kind: "create" }
	| { kind: "cancel"; appointment: AppointmentView }
	| { kind: "reschedule"; appointment: AppointmentView }
	| null;

const COLUMNS = "grid-cols-[72px_1.4fr_1.1fr_1.2fr_140px_340px]";

export function DayPanel() {
	const [day, setDay] = useState(today());
	const [practitioner, setPractitioner] = useState("");
	const [dialog, setDialog] = useState<Dialog>(null);

	const panel = useGetDayPanel({ query: { day } });
	const practitioners = useListPractitioners();

	const appointments = (panel.data ?? []).filter(
		(appointment) =>
			!practitioner || String(appointment.practitionerId) === practitioner,
	);

	return (
		<>
			<TopBar
				title="Painel do dia"
				meta={dayLabel(day)}
				actions={
					<>
						<Button
							variant="secondary"
							onClick={() => setDay(shiftDays(day, -1))}
						>
							‹
						</Button>
						<Button variant="secondary" onClick={() => setDay(today())}>
							Hoje
						</Button>
						<Button
							variant="secondary"
							onClick={() => setDay(shiftDays(day, 1))}
						>
							›
						</Button>
						<Button onClick={() => setDialog({ kind: "create" })}>
							+ Novo agendamento
						</Button>
					</>
				}
			/>

			<Page>
				<div className="grid grid-cols-6 gap-3">
					{summarise(appointments).map((counter) => (
						<div
							key={counter.label}
							className="flex flex-col gap-1 rounded-[10px] border border-line bg-panel px-4 py-3"
						>
							<span className="text-[11.5px] text-muted">{counter.label}</span>
							<span
								className={`w-fit rounded px-1.5 text-[22px] font-semibold ${TONE_SURFACE[counter.tone]}`}
							>
								{counter.value}
							</span>
						</div>
					))}
				</div>

				<Panel>
					<div className="flex items-center gap-3 border-b border-line px-4 py-3">
						<span className="text-[12px] text-muted">Profissional</span>
						<Select
							value={practitioner}
							onChange={(event) => setPractitioner(event.target.value)}
							className="h-[32px] w-[240px]"
							aria-label="Filtrar por profissional"
						>
							<option value="">Todos</option>
							{(practitioners.data ?? []).map((item) => (
								<option key={item.id} value={item.id}>
									{item.name}
								</option>
							))}
						</Select>
					</div>

					<div
						className={`grid ${COLUMNS} gap-3 border-b border-line bg-surface px-4 py-2.5 text-[11.5px] font-semibold text-muted uppercase`}
					>
						<span>Hora</span>
						<span>Paciente</span>
						<span>Profissional</span>
						<span>Serviço</span>
						<span>Estado</span>
						<span />
					</div>

					{panel.isPending ? <Loading /> : null}

					{!panel.isPending && appointments.length === 0 ? (
						<EmptyState
							title="Nenhum atendimento neste dia"
							description="Escolha outra data ou crie um novo agendamento para esta agenda."
							actions={
								<Button onClick={() => setDialog({ kind: "create" })}>
									Novo agendamento
								</Button>
							}
						/>
					) : null}

					{appointments.map((appointment) => (
						<AppointmentRow
							key={appointment.id}
							appointment={appointment}
							columns={COLUMNS}
							onCancel={() => setDialog({ kind: "cancel", appointment })}
							onReschedule={() =>
								setDialog({ kind: "reschedule", appointment })
							}
						/>
					))}
				</Panel>
			</Page>

			{dialog?.kind === "create" ? (
				<NewAppointmentDialog day={day} onClose={() => setDialog(null)} />
			) : null}
			{dialog?.kind === "cancel" ? (
				<CancelAppointmentDialog
					appointment={dialog.appointment}
					onClose={() => setDialog(null)}
				/>
			) : null}
			{dialog?.kind === "reschedule" ? (
				<RescheduleAppointmentDialog
					appointment={dialog.appointment}
					onClose={() => setDialog(null)}
				/>
			) : null}
		</>
	);
}

function Loading() {
	return (
		<div className="px-4 py-10 text-center text-[12.5px] text-muted">
			Carregando atendimentos…
		</div>
	);
}
