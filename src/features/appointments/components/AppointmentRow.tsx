import { Link } from "@tanstack/react-router";
import type { AppointmentView } from "#/api/gen/types";
import { clockTime } from "#/shared/format/date";
import { Badge } from "#/shared/ui/Badge";
import { cn } from "#/shared/ui/cn";
import { Menu, MenuItem } from "#/shared/ui/Menu";
import { announcePending } from "#/shared/ui/pending";
import { useAppointmentActions } from "../hooks/use-appointment-actions";
import { useOpenEncounter } from "../hooks/use-open-encounter";
import { useStartEncounter } from "../hooks/use-start-encounter";
import { describeStatus, isUnderway } from "../model/appointment-status";

const NO_SHOW_REASON = "Paciente não compareceu ao horário marcado";
const ACTION =
	"text-[12.5px] text-brand hover:text-brand-ink disabled:text-faint";

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
			className={cn(
				"grid items-center border-b border-line-soft px-4 py-[9px] last:border-b-0 hover:bg-row-hover",
				columns,
				isUnderway(appointment.status) ? "bg-brand-tint" : "bg-panel",
			)}
		>
			<span className="text-[13.5px] font-semibold text-ink">
				{clockTime(appointment.start)}
			</span>

			<div className="flex min-w-0 flex-col leading-tight">
				<Link
					to="/clientes/$customerId"
					params={{ customerId: String(appointment.customerId) }}
					className="truncate text-[13.5px] text-ink hover:text-brand-ink"
				>
					{appointment.customerName ?? "—"}
				</Link>
				{appointment.reason ? (
					<span className="truncate text-[11.5px] text-faint">
						{appointment.reason}
					</span>
				) : null}
			</div>

			<span className="truncate text-[13px] text-muted">
				{appointment.practitionerName ?? "—"}
			</span>
			<span className="truncate text-[13px] text-ink">
				{appointment.serviceName ?? "—"}
			</span>

			<Badge tone={status.tone}>{status.label}</Badge>

			<div className="flex items-center justify-end gap-3">
				<PrimaryAction
					appointment={appointment}
					onReschedule={onReschedule}
					label={status.action}
				/>
				<Menu
					label={`Mais ações de ${appointment.customerName ?? "agendamento"}`}
				>
					<SecondaryActions
						appointment={appointment}
						onCancel={onCancel}
						onReschedule={onReschedule}
					/>
				</Menu>
			</div>
		</div>
	);
}

type PrimaryActionProps = {
	appointment: AppointmentView;
	label: string;
	onReschedule: () => void;
};

function PrimaryAction({
	appointment,
	label,
	onReschedule,
}: PrimaryActionProps) {
	const { checkIn } = useAppointmentActions();
	const encounter = useStartEncounter();
	const openEncounter = useOpenEncounter(appointment);
	const id = appointment.id as string;

	if (appointment.status === "SCHEDULED") {
		return (
			<button
				type="button"
				onClick={() => announcePending("A confirmação do paciente")}
				className={ACTION}
			>
				{label}
			</button>
		);
	}

	if (appointment.status === "CONFIRMED") {
		return (
			<button
				type="button"
				onClick={() => checkIn.mutate({ path: { id } })}
				disabled={checkIn.isPending}
				className={ACTION}
			>
				{label}
			</button>
		);
	}

	if (appointment.status === "ARRIVED") {
		return (
			<button
				type="button"
				onClick={() => encounter.start(appointment)}
				disabled={encounter.isPending}
				className={ACTION}
			>
				{label}
			</button>
		);
	}

	if (appointment.status === "IN_PROGRESS") {
		return openEncounter ? (
			<Link
				to="/atendimentos/$encounterId"
				params={{ encounterId: openEncounter }}
				className={ACTION}
			>
				{label}
			</Link>
		) : (
			<span className="text-[12.5px] text-faint">{label}</span>
		);
	}

	if (appointment.status === "COMPLETED") {
		return (
			<Link
				to="/clientes/$customerId/historico"
				params={{ customerId: String(appointment.customerId) }}
				className={ACTION}
			>
				{label}
			</Link>
		);
	}

	return (
		<button type="button" onClick={onReschedule} className={ACTION}>
			{label}
		</button>
	);
}

type SecondaryActionsProps = Omit<AppointmentRowProps, "columns">;

function SecondaryActions({
	appointment,
	onCancel,
	onReschedule,
}: SecondaryActionsProps) {
	const { markNoShow } = useAppointmentActions();
	const id = appointment.id as string;

	return (
		<>
			<MenuItem onClick={onReschedule}>Reagendar</MenuItem>
			<MenuItem
				onClick={() =>
					markNoShow.mutate({ path: { id }, body: { reason: NO_SHOW_REASON } })
				}
				disabled={markNoShow.isPending}
			>
				Registrar falta
			</MenuItem>
			<MenuItem
				onClick={() => announcePending("O envio de lembrete ao paciente")}
			>
				Enviar lembrete
			</MenuItem>
			<MenuItem onClick={onCancel} danger>
				Cancelar agendamento
			</MenuItem>
		</>
	);
}
