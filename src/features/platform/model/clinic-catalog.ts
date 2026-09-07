import type { ClinicView } from "#/api/gen/types";

export class ClinicCatalog {
	private constructor(private readonly items: readonly ClinicView[]) {}

	static from(items: ClinicView[] | undefined) {
		return new ClinicCatalog(items ?? []);
	}

	matching(term: string, status: string) {
		return new ClinicCatalog(
			this.items.filter(
				(clinic) => answersTo(clinic, term) && holds(clinic, status),
			),
		);
	}

	countOf(status: string) {
		return this.items.filter((clinic) => clinic.status === status).length;
	}

	total() {
		return this.items.length;
	}

	isEmpty() {
		return this.items.length === 0;
	}

	map<T>(project: (clinic: ClinicView) => T) {
		return this.items.map(project);
	}
}

function answersTo(clinic: ClinicView, term: string) {
	const wanted = term.trim().toLowerCase();
	const searchable = `${clinic.name ?? ""} ${clinic.code ?? ""}`.toLowerCase();
	return wanted === "" || searchable.includes(wanted);
}

function holds(clinic: ClinicView, status: string) {
	return status === "" || clinic.status === status;
}
