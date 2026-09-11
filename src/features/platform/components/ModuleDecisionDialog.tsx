import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { Modal } from "#/shared/ui/Modal";
import type { ModuleDecision } from "../model/module-decision";

type ModuleDecisionDialogProps = {
	decision: ModuleDecision;
	isSaving: boolean;
	onClose: () => void;
	onActivate: (code: string) => Promise<unknown>;
	onDeactivate: (code: string) => Promise<unknown>;
};

export function ModuleDecisionDialog(props: ModuleDecisionDialogProps) {
	if (props.decision.kind === "activateWithDependency") {
		return <DependencyOffer {...props} decision={props.decision} />;
	}

	if (props.decision.kind === "deactivationBlocked") {
		return <DeactivationRefusal {...props} decision={props.decision} />;
	}

	return <DeactivationConfirmation {...props} decision={props.decision} />;
}

type OfferProps = ModuleDecisionDialogProps & {
	decision: Extract<ModuleDecision, { kind: "activateWithDependency" }>;
};

function DependencyOffer({
	decision,
	isSaving,
	onClose,
	onActivate,
}: OfferProps) {
	const { module, dependency } = decision;

	async function activateBoth() {
		await onActivate(dependency.code ?? "");
		await onActivate(module.code ?? "");
		onClose();
	}

	return (
		<Modal
			title={`Turning on ${module.name} requires ${dependency.name}`}
			subtitle={module.description}
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={activateBoth} disabled={isSaving}>
						Turn on both modules
					</Button>
				</>
			}
		>
			<ModuleLine
				module={dependency}
				note="will be turned on too"
				tone="warn"
			/>
			<ModuleLine module={module} note="requested module" tone="brand" />
			<p className="m-0 text-[12.5px] leading-relaxed text-muted">
				Turning both on also enables the parameters that depend on them in this
				clinic parameters screen.
			</p>
		</Modal>
	);
}

type RefusalProps = ModuleDecisionDialogProps & {
	decision: Extract<ModuleDecision, { kind: "deactivationBlocked" }>;
};

function DeactivationRefusal({
	decision,
	isSaving,
	onClose,
	onDeactivate,
}: RefusalProps) {
	const { module, dependents } = decision;
	const first = dependents[0];

	async function releaseDependent() {
		await onDeactivate(first.code ?? "");
		onClose();
	}

	return (
		<Modal
			title={`${module.name} cannot be turned off`}
			dismissal="guarded"
			subtitle="The order is mandatory and the console does not reverse it automatically."
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Got it
					</Button>
					<Button onClick={releaseDependent} disabled={isSaving}>
						Turn off {first.name}
					</Button>
				</>
			}
		>
			<Callout tone="danger">
				Turning off {module.name} would leave the records of the modules that
				depend on it without a reference.
			</Callout>
			<span className="text-[11.5px] font-semibold tracking-[1.1px] text-muted uppercase">
				Depends on {module.name}
			</span>
			{dependents.map((dependent) => (
				<ModuleLine
					key={dependent.code}
					module={dependent}
					note="active in this clinic"
					tone="brand"
				/>
			))}
		</Modal>
	);
}

type ConfirmationProps = ModuleDecisionDialogProps & {
	decision: Extract<ModuleDecision, { kind: "confirmDeactivation" }>;
};

function DeactivationConfirmation({
	decision,
	isSaving,
	onClose,
	onDeactivate,
}: ConfirmationProps) {
	const { module } = decision;

	async function turnOff() {
		await onDeactivate(module.code ?? "");
		onClose();
	}

	return (
		<Modal
			title={`Turn off ${module.name}?`}
			dismissal="guarded"
			subtitle="The data is not erased — it just stops being reachable while the module is off."
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Keep it on
					</Button>
					<Button variant="danger" onClick={turnOff} disabled={isSaving}>
						Turn off module
					</Button>
				</>
			}
		>
			<p className="m-0 text-[12.5px] leading-relaxed text-muted">
				On the clinic side the module disappears entirely: no menu, no field, no
				notice. If it is turned back on, everything returns as it was.
			</p>
		</Modal>
	);
}

type ModuleLineProps = {
	module: { code?: string; name?: string };
	note: string;
	tone: "brand" | "warn";
};

function ModuleLine({ module, note, tone }: ModuleLineProps) {
	return (
		<div className="flex items-center gap-3 rounded-field border border-line px-3.5 py-2.5">
			<div className="flex min-w-0 flex-col">
				<span className="text-[13px] font-medium text-ink">{module.name}</span>
				<span className="text-[11.5px] text-muted">{note}</span>
			</div>
			<span className="ml-auto">
				<Badge tone={tone} withDot={false}>
					{module.code}
				</Badge>
			</span>
		</div>
	);
}
