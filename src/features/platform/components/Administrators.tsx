import * as z from "zod";
import { useRegisterPlatformAdministrator } from "#/api/gen/hooks";
import { Page } from "#/features/navigation/components/AppShell";
import { TopBar } from "#/features/navigation/components/TopBar";
import { messageOf } from "#/shared/api-error";
import { submitHandler, useAppForm, validatedBy } from "#/shared/form/app-form";
import { password, requiredEmail, requiredText } from "#/shared/form/schema";
import { showViolations } from "#/shared/form/violations";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Panel, PanelHeader } from "#/shared/ui/Panel";

const administratorSchema = z.object({
	name: requiredText("Enter the name."),
	email: requiredEmail,
	password: password(),
});

type AdministratorDraft = z.infer<typeof administratorSchema>;

const EMPTY: AdministratorDraft = { name: "", email: "", password: "" };

export function Administrators() {
	const register = useRegisterPlatformAdministrator();

	const form = useAppForm({
		defaultValues: EMPTY,
		...validatedBy(administratorSchema),
		onSubmit: ({ value }) =>
			register.mutate(
				{ body: value },
				{
					onError: (error) => showViolations(error, form),
					onSuccess: () => form.reset(EMPTY),
				},
			),
	});

	return (
		<>
			<TopBar
				title="Platform administrators"
				meta="Clivo staff with access to this console · there is no public sign-up"
			/>

			<Page>
				<div className="grid grid-cols-[1fr_1fr] items-start gap-4">
					<Panel className="p-5">
						<form
							onSubmit={submitHandler(form)}
							noValidate
							className="flex flex-col gap-5"
						>
							<div className="flex flex-col gap-1">
								<span className="text-[13.5px] font-semibold text-ink">
									Add administrator
								</span>
								<span className="text-[12px] text-muted">
									The person signs in with the email and initial password set
									here.
								</span>
							</div>

							<form.AppField name="name">
								{(field) => <field.TextField label="Name" required />}
							</form.AppField>

							<form.AppField name="email">
								{(field) => (
									<field.TextField
										label="Email"
										type="email"
										inputMode="email"
										required
									/>
								)}
							</form.AppField>

							<form.AppField name="password">
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

							{register.isError ? (
								<Callout tone="danger">{messageOf(register.error)}</Callout>
							) : null}

							{register.isSuccess ? (
								<Callout tone="brand">
									Administrator created. The access covers every clinic in this
									instance.
								</Callout>
							) : null}

							<div className="flex justify-end">
								<Button type="submit" disabled={register.isPending}>
									{register.isPending ? "Creating…" : "Create administrator"}
								</Button>
							</div>
						</form>
					</Panel>

					<Panel>
						<PanelHeader
							title="What this access grants"
							hint="There is no partial role in this console."
						/>
						<div className="flex flex-col gap-3 p-5">
							<p className="m-0 text-[12.5px] leading-relaxed text-muted">
								Platform administrators see every clinic in this instance, the
								modules each one contracted and the parameters in force. Every
								access to this console is created by someone already authorized.
							</p>
							<Callout
								tone="warn"
								title="The listing does not exist in the API yet"
							>
								The platform exposes only the creation of administrators. Until
								a query endpoint exists, the console cannot show who already has
								access, nor revoke an access already granted.
							</Callout>
						</div>
					</Panel>
				</div>
			</Page>
		</>
	);
}
