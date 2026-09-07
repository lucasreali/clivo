const NATIONAL_ID = "###.###.###-##";
const TAX_ID = "##.###.###/####-##";
const POSTAL_CODE = "#####-###";
const MOBILE_PHONE = "(##) #####-####";
const LANDLINE_PHONE = "(##) ####-####";

export function digitsOf(value: string | undefined) {
	return (value ?? "").replace(/\D/g, "");
}

export function nationalId(value: string | undefined) {
	const digits = digitsOf(value);
	if (digits.length !== 11) {
		return value ?? "—";
	}

	return applyMask(NATIONAL_ID, digits);
}

export function taxId(value: string | undefined) {
	const digits = digitsOf(value);
	if (digits.length !== 14) {
		return value ?? "—";
	}

	return applyMask(TAX_ID, digits);
}

export function phone(value: string | undefined) {
	const digits = digitsOf(value);
	if (digits.length === 11 || digits.length === 10) {
		return maskPhone(digits);
	}

	return value ?? "—";
}

export function postalCode(value: string | undefined) {
	const digits = digitsOf(value);
	if (digits.length !== 8) {
		return value ?? "—";
	}

	return applyMask(POSTAL_CODE, digits);
}

export function maskNationalId(value: string) {
	return applyMask(NATIONAL_ID, digitsOf(value).slice(0, 11));
}

export function maskTaxId(value: string) {
	return applyMask(TAX_ID, digitsOf(value).slice(0, 14));
}

export function maskPostalCode(value: string) {
	return applyMask(POSTAL_CODE, digitsOf(value).slice(0, 8));
}

export function maskPhone(value: string) {
	const digits = digitsOf(value).slice(0, 11);
	return applyMask(digits.length > 10 ? MOBILE_PHONE : LANDLINE_PHONE, digits);
}

/**
 * Fills the mask with the digits typed so far and stops at the first slot the
 * typist has not reached, so a separator only appears once a digit follows it.
 */
function applyMask(pattern: string, digits: string) {
	let filled = "";
	let next = 0;

	for (const slot of pattern) {
		if (next >= digits.length) {
			return filled;
		}
		if (slot === "#") {
			filled += digits[next];
			next += 1;
			continue;
		}
		filled += slot;
	}

	return filled;
}
