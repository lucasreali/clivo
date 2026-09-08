import type { SessionView } from "#/api/gen/types";

const PLATFORM_ADMIN = "PLATFORM_ADMIN";

export class Access {
	private constructor(private readonly role: string | undefined) {}

	static of(session: SessionView) {
		return new Access(session.role);
	}

	administersPlatform() {
		return this.role === PLATFORM_ADMIN;
	}

	belongsToClinic() {
		return !this.administersPlatform();
	}
}
