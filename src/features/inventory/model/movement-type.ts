import type { Option } from "#/shared/ui/options";
import type { Tone } from "#/shared/ui/tone";

/**
 * An adjustment sets the stock to the quantity it carries; the other three add
 * to it or take from it. The mark is what tells the reader which happened.
 */
type MovementKind = {
	label: string;
	tone: Tone;
	mark: "+" | "−" | "=" | "·";
	hint: string;
};

const INBOUND = "INBOUND";

const DISCARD = "DISCARD";

const KINDS: Record<string, MovementKind> = {
	INBOUND: {
		label: "Entrada",
		tone: "brand",
		mark: "+",
		hint: "Soma ao saldo — compra, doação ou devolução",
	},
	OUTBOUND: {
		label: "Saída",
		tone: "info",
		mark: "−",
		hint: "Subtrai do saldo — uso fora do atendimento",
	},
	ADJUSTMENT: {
		label: "Ajuste",
		tone: "warn",
		mark: "=",
		hint: "Define o saldo — resultado de uma contagem",
	},
	DISCARD: {
		label: "Descarte",
		tone: "danger",
		mark: "−",
		hint: "Subtrai do saldo — perda, quebra ou vencimento",
	},
};

const UNKNOWN: MovementKind = {
	label: "—",
	tone: "neutral",
	mark: "·",
	hint: "",
};

export function describeMovementType(type: string | undefined) {
	return KINDS[type ?? ""] ?? UNKNOWN;
}

const OPTIONS: readonly Option[] = Object.entries(KINDS).map(
	([value, kind]) => ({ value, label: kind.label, hint: kind.hint }),
);

/**
 * Variability mechanism A, in the shape of the form itself. A generic discard
 * only lowers the product balance — it never touches a lot. On a batch-controlled
 * product that would leave the lot whole and still on the shelf, and the later
 * discard of that lot would try to lower the balance a second time and be refused
 * forever. Those products discard through the Lotes panel instead.
 */
export function movementOptionsFor(batchControlled: boolean | undefined) {
	if (!batchControlled) {
		return OPTIONS;
	}
	return OPTIONS.filter((option) => option.value !== DISCARD);
}

export const DEFAULT_MOVEMENT = INBOUND;
