import type { PlatformModuleView } from "#/api/gen/types";
import type { ModuleCatalog } from "./module-catalog";

export type ModuleDecision =
	| {
			kind: "activateWithDependency";
			module: PlatformModuleView;
			dependency: PlatformModuleView;
	  }
	| {
			kind: "deactivationBlocked";
			module: PlatformModuleView;
			dependents: readonly PlatformModuleView[];
	  }
	| { kind: "confirmDeactivation"; module: PlatformModuleView };

export function decisionOn(
	catalog: ModuleCatalog,
	module: PlatformModuleView,
): ModuleDecision | undefined {
	if (module.active) {
		return deactivationOf(catalog, module);
	}

	const dependency = catalog.missingDependencyOf(module);
	return dependency
		? { kind: "activateWithDependency", module, dependency }
		: undefined;
}

function deactivationOf(
	catalog: ModuleCatalog,
	module: PlatformModuleView,
): ModuleDecision {
	const dependents = catalog.dependentsOf(module);
	return dependents.length > 0
		? { kind: "deactivationBlocked", module, dependents }
		: { kind: "confirmDeactivation", module };
}
