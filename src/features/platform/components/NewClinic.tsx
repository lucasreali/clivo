import { useNavigate } from "@tanstack/react-router";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { messageOf } from "#/shared/api-error";
import { submitHandler, useAppForm, validatedBy } from "#/shared/form/app-form";
import { showViolations } from "#/shared/form/violations";
import { maskTaxId } from "#/shared/format/document";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { useClinicOnboarding } from "../hooks/use-clinics";
import {
	clinicSchema,
	EMPTY_CLINIC_DRAFT,
	newClinicRequestOf,
} from "../model/clinic-draft";

export function NewClinic() {
	const navigate = useNavigate();
	const onboarding = useClinicOnboarding();

	const form = useAppForm({
		defaultValues: EMPTY_CLINIC_DRAFT,
		...validatedBy(clinicSchema),
		onSubmit: ({ value }) =>
			onboarding.mutate(
				{ body: newClinicRequestOf(value) },
				{
					onError: (error) => showViolations(error, form),
					onSuccess: (provisioned) =>
						navigate({
							to: "/console/clinics/$tenantId/modules",
							params: { tenantId: String(provisioned.clinic?.id) },
						}),
				},
			),
	});

	return (
		<>
			<TopBar title="New clinic" meta="Console · Clinics · registration" />

			<Page>
				<form
					onSubmit={submitHandler(form)}
					noValidate
					className="flex flex-col gap-4"
				>
					<div className="grid grid-cols-[1.7fr_1fr] items-start gap-4">
						<div className="flex flex-col gap-4">
							<Panel>
								<PanelHeader
									title="Part 1 · Clinic details"
									hint="How the tenant is identified in this instance."
								/>
								<div className="grid grid-cols-2 gap-5 p-5">
									<form.AppField name="name">
										{(field) => (
											<field.TextField
												label="Clinic name"
												required
												hint="How the clinic shows up on screens and reports."
											/>
										)}
									</form.AppField>
									<form.AppField name="legalName">
										{(field) => <field.TextField label="Legal name" />}
									</form.AppField>
									<form.AppField name="taxId">
										{(field) => (
											<field.TextField
												label="CNPJ"
												mask={maskTaxId}
												inputMode="numeric"
												placeholder="00.000.000/0000-00"
												hint="Identifies the clinic on the platform: one CNPJ belongs to a single clinic."
											/>
										)}
									</form.AppField>
									<form.AppField name="segment">
										{(field) => (
											<field.TextField
												label="Segment"
												hint="Dentistry, physiotherapy, veterinary… it guides onboarding, it does not lock the configuration."
											/>
										)}
									</form.AppField>
								</div>
							</Panel>

							<Panel>
								<PanelHeader
									title="Part 2 · First manager"
									hint="Without this user the clinic starts unreachable: nobody on the customer side can sign in or create other users."
								/>
								<div className="grid grid-cols-2 gap-5 p-5">
									<form.AppField name="managerName">
										{(field) => <field.TextField label="Name" required />}
									</form.AppField>
									<form.AppField name="managerEmail">
										{(field) => (
											<field.TextField
												label="Email"
												type="email"
												inputMode="email"
												required
											/>
										)}
									</form.AppField>
									<form.AppField name="managerPassword">
										{(field) => (
											<field.TextField
												label="Initial password"
												type="password"
												autoComplete="new-password"
												required
												hint="At least 8 characters. Agree on changing it at first sign-in."
											/>
										)}
									</form.AppField>
								</div>
							</Panel>
						</div>

						<Panel className="flex flex-col gap-3 p-5">
							<span className="text-[13.5px] font-semibold text-ink">
								How the clinic starts
							</span>
							<Callout tone="warn" title="With no module active">
								Only scheduling, customers and encounters — the core every
								clinic has. Once created, the next step is configuring the
								modules.
							</Callout>
							<p className="m-0 text-[12.5px] leading-relaxed text-muted">
								The manager gets the clinic administrator role: creates users,
								sets working hours and operates every active module. They have
								no access to this console.
							</p>
							<p className="m-0 text-[12px] leading-relaxed text-faint">
								The clinic is addressed by the identifier the platform
								generates. The CNPJ, when given, cannot repeat in another
								clinic.
							</p>
						</Panel>
					</div>

					{onboarding.isError ? (
						<Callout tone="danger">{messageOf(onboarding.error)}</Callout>
					) : null}

					<div className="flex justify-end gap-2">
						<Button
							variant="secondary"
							onClick={() => navigate({ to: "/console" })}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={onboarding.isPending}>
							{onboarding.isPending ? "Creating…" : "Create clinic"}
						</Button>
					</div>
				</form>
			</Page>
		</>
	);
}
