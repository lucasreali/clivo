const BRL = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

export function money(amount: number | undefined) {
	return BRL.format(amount ?? 0);
}
