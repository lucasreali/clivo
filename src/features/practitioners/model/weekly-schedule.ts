import * as z from "zod";
import {
	type PeriodRequestWeekdayEnumKey,
	type PeriodView,
	periodRequestWeekdayEnum,
	type ScheduleRequest,
} from "#/api/gen/types";
import type { Option } from "#/shared/ui/options";

type Weekday = PeriodRequestWeekdayEnumKey;

const WEEKDAYS: Record<Weekday, { short: string; long: string }> = {
	MONDAY: { short: "Seg", long: "Segunda-feira" },
	TUESDAY: { short: "Ter", long: "Terça-feira" },
	WEDNESDAY: { short: "Qua", long: "Quarta-feira" },
	THURSDAY: { short: "Qui", long: "Quinta-feira" },
	FRIDAY: { short: "Sex", long: "Sexta-feira" },
	SATURDAY: { short: "Sáb", long: "Sábado" },
	SUNDAY: { short: "Dom", long: "Domingo" },
};

const IN_WEEK_ORDER = Object.values(periodRequestWeekdayEnum);

export const WEEKDAY_OPTIONS: readonly Option[] = IN_WEEK_ORDER.map(
	(weekday) => ({ value: weekday, label: WEEKDAYS[weekday].long }),
);

const TIME = /^\d{2}:\d{2}$/;

const periodSchema = z.object({
	weekday: z.enum(IN_WEEK_ORDER, { message: "Escolha o dia da semana." }),
	start: z.string().regex(TIME, "Informe o início."),
	end: z.string().regex(TIME, "Informe o fim."),
});

/**
 * Mirrors the API's `WeeklySchedule`: every period ends after it starts and no
 * two periods of the same day overlap. Both are checked here so the message
 * lands on the row at fault instead of arriving as one sentence from the API.
 */
export const scheduleSchema = z
	.object({ periods: z.array(periodSchema) })
	.superRefine(({ periods }, context) => {
		periods.forEach((period, index) => {
			if (period.start >= period.end) {
				context.addIssue({
					code: "custom",
					path: ["periods", index, "end"],
					message: "O fim vem depois do início.",
				});
				return;
			}

			const collides = periods.some(
				(other, at) =>
					at !== index &&
					other.weekday === period.weekday &&
					other.start < other.end &&
					period.start < other.end &&
					other.start < period.end,
			);
			if (collides) {
				context.addIssue({
					code: "custom",
					path: ["periods", index, "start"],
					message: "Este horário cruza outro período do mesmo dia.",
				});
			}
		});
	});

export type ScheduleDraft = z.infer<typeof scheduleSchema>;

export type PeriodDraft = ScheduleDraft["periods"][number];

export const NEW_PERIOD: PeriodDraft = {
	weekday: periodRequestWeekdayEnum.MONDAY,
	start: "08:00",
	end: "12:00",
};

/** The API serves `LocalTime` with seconds ("08:00:00"); the control holds minutes. */
function minutesOf(time: string | undefined) {
	return (time ?? "").slice(0, 5);
}

function isWeekday(value: string | undefined): value is Weekday {
	return value !== undefined && value in WEEKDAYS;
}

export function scheduleDraftOf(
	availability: readonly PeriodView[] | undefined,
): ScheduleDraft {
	return {
		periods: (availability ?? []).flatMap((period) =>
			isWeekday(period.weekday)
				? [
						{
							weekday: period.weekday,
							start: minutesOf(period.start),
							end: minutesOf(period.end),
						},
					]
				: [],
		),
	};
}

export function scheduleRequestOf(draft: ScheduleDraft): ScheduleRequest {
	return { periods: draft.periods };
}

/**
 * One line per day, in week order: "Seg 08:00–12:00, 14:00–18:00". The API
 * already sorts the periods, so grouping keeps the order it was given.
 */
export function availabilitySummary(
	availability: readonly PeriodView[] | undefined,
): string[] {
	const byDay = new Map<Weekday, string[]>();

	for (const period of availability ?? []) {
		if (!isWeekday(period.weekday)) {
			continue;
		}
		const hours = `${minutesOf(period.start)}–${minutesOf(period.end)}`;
		byDay.set(period.weekday, [...(byDay.get(period.weekday) ?? []), hours]);
	}

	return IN_WEEK_ORDER.filter((day) => byDay.has(day)).map(
		(day) => `${WEEKDAYS[day].short} ${byDay.get(day)?.join(", ")}`,
	);
}
