import { useState } from "react";
import { useGetDayPanel, useListPractitioners } from "#/api/gen/hooks";
import type { AppointmentView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { clockTime, dayLabel, shiftDays, today } from "#/shared/format/date";
import { Button } from "#/shared/ui/Button";
import { cn } from "#/shared/ui/cn";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel } from "#/shared/ui/Panel";
import { announcePending } from "#/shared/ui/pending";
import { TONE_TEXT } from "#/shared/ui/tone";
import { summarise } from "../model/day-summary";
import { AppointmentRow } from "./AppointmentRow";
import { CancelAppointmentDialog } from "./CancelAppointmentDialog";
import { NewAppointmentDrawer } from "./NewAppointmentDrawer";
import { RescheduleAppointmentDrawer } from "./RescheduleAppointmentDrawer";

type Overlay =
	| { kind: "create" }
	| { kind: "cancel"; appointment: AppointmentView }
	| { kind: "reschedule"; appointment: AppointmentView }
	| null;

const COLUMNS = "grid-cols-[78px_1.5fr_1.4fr_1.6fr_190px_150px]";

const CHIP =
	"flex h-[30px] items-center rounded-full px-3 text-[12.5px] whitespace-nowrap";

export function DayPanel() {
	const [day, setDay] = useState(today());
	const [practitioner, setPractitioner] = useState("");
	const [overlay, setOverlay] = useState<Overlay>(null);

	const panel = useGetDayPanel({ query: { day } });
	const practitioners = useListPractitioners();

	const appointments = (panel.data ?? []).filter(
		(appointment) =>
			!practitioner || String(appointment.practitionerId) === practitioner,
	);

	return (
		<>
			<AppTopBar
				title="Day panel"
				meta={dayLabel(day)}
				actions={
					<>
						<DayPager day={day} onChange={setDay} />
						<Button onClick={() => setOverlay({ kind: "create" })}>
							+ New appointment
						</Button>
					</>
				}
			/>

			<Page>
				<div className="grid grid-cols-5 gap-3">
					{summarise(appointments).map((counter) => (
						<div
							key={counter.label}
							className="flex flex-col gap-[3px] rounded-field border border-line bg-panel px-3.5 py-3"
						>
							<span className="text-[12px] text-muted">{counter.label}</span>
							<span
								className={cn(
									"text-[24px] leading-[1.1] font-semibold",
									TONE_TEXT[counter.tone],
								)}
							>
								{counter.value}
							</span>
						</div>
					))}
				</div>

				<Panel className="overflow-x-clip">
					<div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
						<div className="flex flex-wrap items-center gap-2">
							<span className="mr-0.5 text-[12.5px] text-muted">
								Practitioner
							</span>
							<PractitionerChip
								label="All"
								isActive={practitioner === ""}
								onSelect={() => setPractitioner("")}
							/>
							{(practitioners.data ?? []).map((item) => (
								<PractitionerChip
									key={item.id}
									label={item.name ?? "—"}
									isActive={practitioner === String(item.id)}
									onSelect={() => setPractitioner(String(item.id))}
								/>
							))}
						</div>
						<div className="flex shrink-0 items-center gap-3.5">
							<span className="text-[12.5px] text-muted">
								{panel.dataUpdatedAt
									? `Updated at ${clockTime(new Date(panel.dataUpdatedAt).toISOString())}`
									: "Updating…"}
							</span>
							<button
								type="button"
								onClick={() => announcePending("Printing the day list")}
								className="text-[12.5px] text-brand hover:text-brand-ink"
							>
								Print list
							</button>
						</div>
					</div>

					<div
						className={cn(
							"grid border-b border-line bg-surface px-4 py-[9px] text-[11.5px] tracking-[0.3px] text-muted uppercase",
							COLUMNS,
						)}
					>
						<span>Time</span>
						<span>Patient</span>
						<span>Practitioner</span>
						<span>Service</span>
						<span>Status</span>
						<span />
					</div>

					{panel.isPending ? <Loading /> : null}

					{!panel.isPending && appointments.length === 0 ? (
						<EmptyState
							title="No encounters on this day"
							description="Pick another date or create a new appointment for this schedule."
							actions={
								<Button onClick={() => setOverlay({ kind: "create" })}>
									New appointment
								</Button>
							}
						/>
					) : null}

					{appointments.map((appointment) => (
						<AppointmentRow
							key={appointment.id}
							appointment={appointment}
							columns={COLUMNS}
							onCancel={() => setOverlay({ kind: "cancel", appointment })}
							onReschedule={() =>
								setOverlay({ kind: "reschedule", appointment })
							}
						/>
					))}
				</Panel>
			</Page>

			{overlay?.kind === "create" ? (
				<NewAppointmentDrawer day={day} onClose={() => setOverlay(null)} />
			) : null}
			{overlay?.kind === "cancel" ? (
				<CancelAppointmentDialog
					appointment={overlay.appointment}
					onClose={() => setOverlay(null)}
				/>
			) : null}
			{overlay?.kind === "reschedule" ? (
				<RescheduleAppointmentDrawer
					appointment={overlay.appointment}
					onClose={() => setOverlay(null)}
				/>
			) : null}
		</>
	);
}

type PractitionerChipProps = {
	label: string;
	isActive: boolean;
	onSelect: () => void;
};

function PractitionerChip({
	label,
	isActive,
	onSelect,
}: PractitionerChipProps) {
	return (
		<button
			type="button"
			onClick={onSelect}
			aria-pressed={isActive}
			className={cn(
				CHIP,
				isActive
					? "bg-brand font-semibold text-white"
					: "border border-line text-muted hover:border-brand hover:text-brand-ink",
			)}
		>
			{label}
		</button>
	);
}

type DayPagerProps = {
	day: string;
	onChange: (day: string) => void;
};

function DayPager({ day, onChange }: DayPagerProps) {
	return (
		<div className="flex h-[34px] items-center overflow-hidden rounded-field border border-line bg-panel">
			<button
				type="button"
				aria-label="Previous day"
				onClick={() => onChange(shiftDays(day, -1))}
				className="h-full w-[34px] border-r border-line text-[14px] text-muted hover:text-ink"
			>
				‹
			</button>
			<button
				type="button"
				onClick={() => onChange(today())}
				className="h-full px-3.5 text-[13px] text-ink"
			>
				Today
			</button>
			<button
				type="button"
				aria-label="Next day"
				onClick={() => onChange(shiftDays(day, 1))}
				className="h-full w-[34px] border-l border-line text-[14px] text-muted hover:text-ink"
			>
				›
			</button>
		</div>
	);
}

function Loading() {
	return (
		<div className="px-4 py-10 text-center text-[12.5px] text-muted">
			Loading encounters…
		</div>
	);
}
