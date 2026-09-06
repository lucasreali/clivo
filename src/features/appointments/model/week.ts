import type { AppointmentView, ScheduleBlockView } from "#/api/gen/types";
import { shiftDays } from "#/shared/format/date";

export const OPENING_HOUR = 8;
export const CLOSING_HOUR = 19;
export const SLOT_MINUTES = 30;

export function daysOfWeek(monday: string) {
	return Array.from({ length: 6 }, (_, offset) => shiftDays(monday, offset));
}

export function slotsOfDay() {
	const count = ((CLOSING_HOUR - OPENING_HOUR) * 60) / SLOT_MINUTES;

	return Array.from({ length: count }, (_, index) => {
		const minutes = OPENING_HOUR * 60 + index * SLOT_MINUTES;
		return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
	});
}

export function appointmentAt(
	appointments: readonly AppointmentView[],
	day: string,
	slot: string,
) {
	return appointments.find((appointment) =>
		startsAt(appointment.start, day, slot),
	);
}

export function blockAt(
	blocks: readonly ScheduleBlockView[],
	day: string,
	slot: string,
) {
	return blocks.find((block) => covers(block, day, slot));
}

function startsAt(instant: string | undefined, day: string, slot: string) {
	if (!instant) {
		return false;
	}

	const start = new Date(instant);
	return localDay(start) === day && localSlot(start) === slot;
}

function covers(block: ScheduleBlockView, day: string, slot: string) {
	const moment = new Date(`${day}T${slot}:00`).getTime();
	return (
		new Date(block.start ?? 0).getTime() <= moment &&
		moment < new Date(block.end ?? 0).getTime()
	);
}

function localDay(date: Date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localSlot(date: Date) {
	const rounded = Math.floor(date.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES;
	return `${pad(date.getHours())}:${pad(rounded)}`;
}

function pad(value: number) {
	return String(value).padStart(2, "0");
}
