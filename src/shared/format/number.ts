/** The API keeps quantities at two decimal places, so a whole number reads as one. */
const AMOUNT = new Intl.NumberFormat("pt-BR", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});

export function quantity(amount: number | undefined) {
	return AMOUNT.format(amount ?? 0);
}

export function quantityWithUnit(
	amount: number | undefined,
	unit: string | undefined,
) {
	return unit ? `${quantity(amount)} ${unit}` : quantity(amount);
}
