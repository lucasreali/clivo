import type { PlatformModuleView } from "#/api/gen/types";

export class ModuleCatalog {
	private constructor(private readonly items: readonly PlatformModuleView[]) {}

	static from(items: PlatformModuleView[] | undefined) {
		return new ModuleCatalog(items ?? []);
	}

	map<T>(project: (module: PlatformModuleView) => T) {
		return this.items.map(project);
	}

	total() {
		return this.items.length;
	}

	activeCount() {
		return this.items.filter(isActive).length;
	}

	missingDependencyOf(module: PlatformModuleView) {
		return this.items.find(
			(other) => other.code === module.requiresModule && !isActive(other),
		);
	}

	dependentsOf(module: PlatformModuleView) {
		return this.items.filter(
			(other) => other.requiresModule === module.code && isActive(other),
		);
	}

	nameOf(code: string | undefined) {
		return this.items.find((other) => other.code === code)?.name ?? code ?? "—";
	}
}

function isActive(module: PlatformModuleView) {
	return module.active === true;
}
