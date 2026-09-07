import type {
	CapabilitiesView,
	ModuleView,
	ParameterView,
} from "#/api/gen/types";
import type { ModuleCode } from "./module-code";

export class Modules {
	private constructor(private readonly items: readonly ModuleView[]) {}

	static from(items: ModuleView[] | undefined) {
		return new Modules(items ?? []);
	}

	reaches(code: ModuleCode) {
		return this.items.some((item) => item.code === code);
	}

	reachesAll(codes: readonly ModuleCode[]) {
		return codes.every((code) => this.reaches(code));
	}

	isEmpty() {
		return this.items.length === 0;
	}

	map<T>(project: (module: ModuleView) => T) {
		return this.items.map(project);
	}
}

export class Parameters {
	private constructor(private readonly items: readonly ParameterView[]) {}

	static from(items: ParameterView[] | undefined) {
		return new Parameters(items ?? []);
	}

	text(code: string, fallback: string) {
		return this.find(code)?.value ?? fallback;
	}

	number(code: string, fallback: number) {
		const parsed = Number(this.find(code)?.value);
		return Number.isFinite(parsed) ? parsed : fallback;
	}

	flag(code: string, fallback: boolean) {
		const value = this.find(code)?.value;
		return value === undefined ? fallback : value === "true";
	}

	map<T>(project: (parameter: ParameterView) => T) {
		return this.items.map(project);
	}

	private find(code: string) {
		return this.items.find((item) => item.code === code);
	}
}

export class Capabilities {
	private constructor(
		readonly modules: Modules,
		readonly parameters: Parameters,
	) {}

	static from(view: CapabilitiesView | undefined) {
		return new Capabilities(
			Modules.from(view?.modules),
			Parameters.from(view?.parameters),
		);
	}
}
