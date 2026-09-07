import type { Tone } from "#/shared/ui/tone";

export function describeModuleChange(action: string | undefined) {
	return action === "ACTIVATION"
		? { label: "ligado", tone: "brand" as Tone }
		: { label: "desligado", tone: "danger" as Tone };
}
