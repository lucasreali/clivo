import type { Tone } from "#/shared/ui/tone";

export function describeModuleChange(action: string | undefined) {
	return action === "ACTIVATION"
		? { label: "turned on", tone: "brand" as Tone }
		: { label: "turned off", tone: "danger" as Tone };
}
