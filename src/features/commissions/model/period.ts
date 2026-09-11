/**
 * The API takes a month as a year and a month number, and answers with the
 * period it read back. Everything the screen needs to walk month by month lives
 * here, so the components never do date arithmetic of their own.
 */
const MONTH = new Intl.DateTimeFormat("pt-BR", {
	month: "long",
	year: "numeric",
});

export type Period = {
	year: number;
	month: number;
};

export function currentPeriod(): Period {
	const now = new Date();
	return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function shiftMonths(period: Period, amount: number): Period {
	const date = new Date(period.year, period.month - 1 + amount, 1);
	return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function periodLabel(period: Period) {
	return MONTH.format(new Date(period.year, period.month - 1, 1));
}

export function isFuture(period: Period) {
	const now = currentPeriod();
	return (
		period.year > now.year ||
		(period.year === now.year && period.month > now.month)
	);
}
