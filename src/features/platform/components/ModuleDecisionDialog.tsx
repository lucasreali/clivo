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
			title={`Ligar ${module.name} exige ${dependency.name}`}
			subtitle={module.description}
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancelar
					</Button>
					<Button onClick={activateBoth} disabled={isSaving}>
						Ligar os dois módulos
					</Button>
				</>
			}
		>
			<ModuleLine module={dependency} note="será ligado junto" tone="warn" />
			<ModuleLine module={module} note="módulo pedido" tone="brand" />
			<p className="m-0 text-[12.5px] leading-relaxed text-muted">
				Ligar os dois habilita também os parâmetros que dependem deles na tela
				de parâmetros desta clínica.
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
			title={`${module.name} não pode ser desligado`}
			dismissal="guarded"
			subtitle="A ordem é obrigatória e o console não a inverte automaticamente."
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Entendi
					</Button>
					<Button onClick={releaseDependent} disabled={isSaving}>
						Desligar {first.name}
					</Button>
				</>
			}
		>
			<Callout tone="danger">
				Desligar {module.name} deixaria os registros dos módulos que dependem
				dele sem referência.
			</Callout>
			<span className="text-[11.5px] font-semibold tracking-[1.1px] text-muted uppercase">
				Depende de {module.name}
			</span>
			{dependents.map((dependent) => (
				<ModuleLine
					key={dependent.code}
					module={dependent}
					note="ativo nesta clínica"
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
			title={`Desligar ${module.name}?`}
			dismissal="guarded"
			subtitle="Os dados não são apagados — deixam de ser acessíveis enquanto o módulo estiver desligado."
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Manter ligado
					</Button>
					<Button variant="danger" onClick={turnOff} disabled={isSaving}>
						Desligar módulo
					</Button>
				</>
			}
		>
			<p className="m-0 text-[12.5px] leading-relaxed text-muted">
				Do lado da clínica o módulo desaparece por completo: nenhum menu, nenhum
				campo, nenhum aviso. Se for religado, tudo volta como estava.
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
