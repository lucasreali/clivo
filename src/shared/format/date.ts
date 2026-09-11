const DAY = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const TIME = new Intl.DateTimeFormat("pt-BR", {
	hour: "2-digit",
	minute: "2-digit",
});
const LONG_DAY = new Intl.DateTimeFormat("pt-BR", {
	weekday: "long",
	day: "numeric",
	month: "long",
	year: "numeric",
});
const WEEKDAY = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const DAY_MONTH = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
});

export function isoDay(date: Date) {
	const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
	return local.toISOString().slice(0, 10);
}

export function today() {
	return isoDay(new Date());
}

export function shiftDays(day: string, amount: number) {
	const date = new Date(`${day}T12:00:00`);
	date.setDate(date.getDate() + amount);
	return isoDay(date);
}

export function startOfWeek(day: string) {
	const date = new Date(`${day}T12:00:00`);
	const offset = (date.getDay() + 6) % 7;
	return shiftDays(day, -offset);
}

export function dayLabel(day: string) {
	return LONG_DAY.format(new Date(`${day}T12:00:00`));
}

export function weekdayLabel(day: string) {
	return WEEKDAY.format(new Date(`${day}T12:00:00`)).replace(".", "");
}

export function dayMonthLabel(day: string) {
	return DAY_MONTH.format(new Date(`${day}T12:00:00`));
}

export function shortDate(instant: string | undefined) {
	return instant ? DAY.format(new Date(instant)) : "—";
}

/**
 * A date the API sends without a time ("2026-10-15") parses as UTC midnight,
 * which reads as the day before anywhere west of Greenwich. Noon local keeps
 * the day the API meant, the same trick `dayLabel` uses.
 */
export function shortDay(day: string | undefined) {
	// Slicing keeps the function total: handed a full instant by mistake, it
	// formats the day rather than throwing on a doubled "T".
	return day ? DAY.format(new Date(`${day.slice(0, 10)}T12:00:00`)) : "—";
}

export function clockTime(instant: string | undefined) {
	return instant ? TIME.format(new Date(instant)) : "—";
}

export function dateTimeLabel(instant: string | undefined) {
	return instant ? `${shortDate(instant)} · ${clockTime(instant)}` : "—";
}

export function toInstant(day: string, time: string) {
	return `${day}T${time}:00`;
}

export function ageLabel(birthDate: string | undefined) {
	if (!birthDate) {
		return undefined;
	}
	const born = new Date(`${birthDate}T12:00:00`);
	const now = new Date();
	const years = now.getFullYear() - born.getFullYear();
	const anniversary = new Date(born);
	anniversary.setFullYear(now.getFullYear());
	return `${now < anniversary ? years - 1 : years} anos`;
}
