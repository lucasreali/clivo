import { digitsOf } from "#/shared/format/document";

const NATIONAL_ID_LENGTH = 11;
const TAX_ID_LENGTH = 14;
const TAX_ID_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function isNationalId(value: string) {
	const digits = digitsOf(value);
	if (digits.length !== NATIONAL_ID_LENGTH || isRepeated(digits)) {
		return false;
	}

	const body = digits.slice(0, 9);
	const first = checkDigitOf(body, countingDownFrom(10));
	const second = checkDigitOf(body + first, countingDownFrom(11));

	return digits === body + first + second;
}

export function isTaxId(value: string) {
	const digits = digitsOf(value);
	if (digits.length !== TAX_ID_LENGTH || isRepeated(digits)) {
		return false;
	}

	const body = digits.slice(0, 12);
	const first = checkDigitOf(body, TAX_ID_WEIGHTS.slice(1));
	const second = checkDigitOf(body + first, TAX_ID_WEIGHTS);

	return digits === body + first + second;
}

export function isPostalCode(value: string) {
	return digitsOf(value).length === 8;
}

export function isPhone(value: string) {
	const digits = digitsOf(value);
	if (digits.length !== 10 && digits.length !== 11) {
		return false;
	}

	const areaCode = Number(digits.slice(0, 2));
	const startsWithNine = digits.length === 11 && digits[2] === "9";

	return areaCode >= 11 && (digits.length === 10 || startsWithNine);
}

/**
 * Both documents check out the same way: weight each digit, sum, and take the
 * remainder of eleven — a remainder under two means the digit is zero.
 */
function checkDigitOf(body: string, weights: readonly number[]) {
	const total = weights.reduce(
		(sum, weight, position) => sum + Number(body[position]) * weight,
		0,
	);
	const remainder = total % 11;

	return String(remainder < 2 ? 0 : 11 - remainder);
}

function countingDownFrom(start: number) {
	return Array.from({ length: start - 1 }, (_, step) => start - step);
}

function isRepeated(digits: string) {
	return new Set(digits).size === 1;
}
