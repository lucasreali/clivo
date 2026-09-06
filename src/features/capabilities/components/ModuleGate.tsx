import { useCapabilities } from "../hooks/use-capabilities";
import type { ModuleCode } from "../model/module-code";

type ModuleGateProps = {
	requires: ModuleCode | readonly ModuleCode[];
	children: React.ReactNode;
	fallback?: React.ReactNode;
};

/**
 * Variability mechanism A: a screen region only exists when the clinic
 * has the modules it depends on turned on.
 */
export function ModuleGate({ requires, children, fallback }: ModuleGateProps) {
	const { capabilities } = useCapabilities();
	const codes = Array.isArray(requires) ? requires : [requires as ModuleCode];

	if (!capabilities.modules.areAllActive(codes)) {
		return fallback ?? null;
	}

	return <>{children}</>;
}
