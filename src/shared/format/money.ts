const BRL = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "BRL",
});

export function money(amount: number | undefined) {
	return BRL.format(amount ?? 0);
}
