import { Link } from "@tanstack/react-router";
import type { AppointmentView } from "#/api/gen/types";
import { clockTime } from "#/shared/format/date";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { useAppointmentActions } from "../hooks/use-appointment-actions";
import { useStartEncounter } from "../hooks/use-start-encounter";
import { awaitsArrival, describeStatus } from "../model/appointment-status";

const NO_SHOW_REASON = "Paciente não compareceu ao horário marcado";

type AppointmentRowProps = {
	appointment: AppointmentView;
	columns: string;
	onCancel: () => void;
	onReschedule: () => void;
};

export function AppointmentRow({
	appointment,
	columns,
	onCancel,
	onReschedule,
}: AppointmentRowProps) {
	const status = describeStatus(appointment.status);

	return (
		<div
			className={`grid ${columns} items-center gap-3 border-b border-line px-4 py-3 text-[13px] last:border-b-0`}
		>
			<span className="font-semibold text-ink">
				{clockTime(appointment.start)}
			</span>

			<Link
				to="/clientes/$customerId"
				params={{ customerId: String(appointment.customerId) }}
				className="truncate font-medium text-ink hover:text-brand-ink"
			>
				{appointment.customerName ?? "—"}
			</Link>

			<span className="truncate text-muted">
				{appointment.practitionerName ?? "—"}
			</span>
			<span className="truncate text-muted">
				{appointment.serviceName ?? "—"}
			</span>

			<Badge tone={status.tone}>{status.label}</Badge>

			<AppointmentActions
				appointment={appointment}
				onCancel={onCancel}
				onReschedule={onReschedule}
			/>
		</div>
	);
}

type ActionsProps = Omit<AppointmentRowProps, "columns">;

function AppointmentActions({
	appointment,
	onCancel,
	onReschedule,
}: ActionsProps) {
	const { checkIn, markNoShow } = useAppointmentActions();
	const encounter = useStartEncounter();
	const id = appointment.id as string;

	if (awaitsArrival(appointment.status)) {
		return (
			<div className="flex justify-end gap-1.5">
				<Button
					variant="secondary"
					onClick={() => checkIn.mutate({ path: { id } })}
					disabled={checkIn.isPending}
				>
					Registrar chegada
				</Button>
				<Button variant="ghost" onClick={onReschedule}>
					Reagendar
				</Button>
				<Button variant="ghost" onClick={onCancel}>
					Cancelar
				</Button>
			</div>
		);
	}

	if (appointment.status === "ARRIVED") {
		return (
			<div className="flex justify-end gap-1.5">
				<Button
					onClick={() => encounter.start(appointment)}
					disabled={encounter.isPending}
				>
					Iniciar atendimento
				</Button>
				<Button
					variant="ghost"
					onClick={() =>
						markNoShow.mutate({
							path: { id },
							body: { reason: NO_SHOW_REASON },
						})
					}
					disabled={markNoShow.isPending}
				>
					Falta
				</Button>
			</div>
		);
	}

	if (appointment.status === "NO_SHOW") {
		return (
			<div className="flex justify-end">
				<Button variant="secondary" onClick={onReschedule}>
					Reagendar
				</Button>
			</div>
		);
	}

	return (
		<div className="flex justify-end">
			<Link
				to="/clientes/$customerId/historico"
				params={{ customerId: String(appointment.customerId) }}
				className="text-[12.5px] font-semibold text-brand-ink"
			>
				Ver histórico
			</Link>
		</div>
	);
}
