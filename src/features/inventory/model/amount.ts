import * as z from "zod";

/**
 * Mirrors the API's `Quantity`: a number with at most two decimal places that is
 * never negative. The controls hold strings, so the rules judge the string and
 * `amountOf` is the single place that turns one into a number.
 */

/** The columns are NUMERIC(10,2); past this the database overflows into a 500. */
const CEILING = 99_999_999.99;

/**
 * The scale is judged on what was typed, not on the parsed number: below 1e-6
 * JavaScript prints in exponential notation, so there is no "." to split on and
 * "0.0000001" would pass as a whole number. Matching the string also refuses
 * what `Number()` is happy to take — "1e3", "0x10", "Infinity".
 */
const TYPED = /^\d+(?:[.,]\d{1,2})?$/;

export function amountOf(value: string): number | undefined {
	const trimmed = value.trim().replace(",", ".");
	if (trimmed === "") {
		return undefined;
	}
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function accepts(rule: (amount: number) => boolean) {
	return (value: string) => {
		const typed = value.trim();
		if (!TYPED.test(typed)) {
			return false;
		}
		const amount = amountOf(typed);
		return amount !== undefined && rule(amount) && amount <= CEILING;
	};
}

const SHAPE = "Use números com até duas casas decimais.";

export const positiveAmount = z
	.string()
	.trim()
	.min(1, "Informe a quantidade.")
	.refine(
		accepts((amount) => amount > 0),
		{
			message: `Informe uma quantidade maior que zero. ${SHAPE}`,
		},
	);

/** An empty minimum means the clinic does not watch this product's floor. */
export const nonNegativeAmount = z
	.string()
	.trim()
	.refine((value) => value === "" || accepts((amount) => amount >= 0)(value), {
		message: `Informe um número igual ou maior que zero. ${SHAPE}`,
	});
