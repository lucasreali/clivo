import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useState } from "react";
import { useGetCommissionStatement } from "#/api/gen/hooks";
import type { CommissionView, StatementView } from "#/api/gen/types";
import { Page } from "#/features/navigation/components/AppShell";
import { AppTopBar } from "#/features/navigation/components/AppTopBar";
import { isNotGranted, messageOf } from "#/shared/api-error";
import { money } from "#/shared/format/money";
import { Badge } from "#/shared/ui/Badge";
import { Button } from "#/shared/ui/Button";
import { Callout } from "#/shared/ui/Callout";
import { cn } from "#/shared/ui/cn";
import { columnsFor, DataTable } from "#/shared/ui/DataTable";
import { EmptyState } from "#/shared/ui/EmptyState";
import { Panel, PanelHeader } from "#/shared/ui/Panel";
import { describeCommissionStatus } from "../model/commission-status";
import {
	currentPeriod,
	isFuture,
	type Period,
	periodLabel,
	shiftMonths,
} from "../model/period";
import { CloseCommissionDialog } from "./CloseCommissionDialog";
import { CommissionRates } from "./CommissionRates";

const column = columnsFor<CommissionView>();

const COLUMNS = column.columns([
	column.accessor("practitionerName", {
		header: "Profissional",
		cell: ({ getValue }) => (
			<span className="text-[13.5px] text-ink">{getValue() ?? "—"}</span>
		),
	}),
	column.accessor("percentage", {
		header: "Percentual",
		meta: { width: "140px", align: "right" },
		cell: ({ getValue }) => (
			<span className="text-muted tabular-nums">{percentage(getValue())}</span>
		),
	}),
	column.accessor("amount", {
		header: "A pagar",
		meta: { width: "160px", align: "right" },
		cell: ({ getValue }) => (
			<span className="font-medium text-ink tabular-nums">
				{money(getValue())}
			</span>
		),
	}),
	column.accessor("status", {
		header: "Situação",
		meta: { width: "150px" },
		cell: ({ getValue }) => {
			const situation = describeCommissionStatus(getValue());
			return <Badge tone={situation.tone}>{situation.label}</Badge>;
		},
	}),
]);

function percentage(value: number | undefined) {
	return value === undefined ? "—" : `${String(value).replace(".", ",")}%`;
}

export function CommissionStatement() {
	const [period, setPeriod] = useState<Period>(currentPeriod());
	const [isClosing, setClosing] = useState(false);

	const statement = useGetCommissionStatement({
		query: { year: period.year, month: period.month },
	});

	const denied = isNotGranted(statement.error);

	return (
		<>
			<AppTopBar
				title="Comissões"
				meta="O que cada profissional recebe do que foi faturado"
			/>

			<Page>
				<Panel>
					<PanelHeader
						title={capitalized(periodLabel(period))}
						hint="A comissão é lançada quando o atendimento é faturado."
						actions={<PeriodPager period={period} onChange={setPeriod} />}
					/>
					<StatementBody
						error={statement.error}
						data={statement.data}
						isPending={statement.isPending}
						onClose={() => setClosing(true)}
					/>
				</Panel>

				{denied ? null : <CommissionRates />}
			</Page>

			{isClosing ? (
				<CloseCommissionDialog
					period={period}
					total={statement.data?.total}
					onClose={() => setClosing(false)}
				/>
			) : null}
		</>
	);
}

type PeriodPagerProps = {
	period: Period;
	onChange: (period: Period) => void;
};

function PeriodPager({ period, onChange }: PeriodPagerProps) {
	const next = shiftMonths(period, 1);

	return (
		<div className="flex items-center gap-1">
			<PagerButton
				label="Mês anterior"
				onClick={() => onChange(shiftMonths(period, -1))}
			>
				<CaretLeft size={13} aria-hidden="true" />
			</PagerButton>
			<PagerButton
				label="Próximo mês"
				disabled={isFuture(next)}
				onClick={() => onChange(next)}
			>
				<CaretRight size={13} aria-hidden="true" />
			</PagerButton>
		</div>
	);
}

type PagerButtonProps = {
	label: string;
	disabled?: boolean;
	onClick: () => void;
	children: React.ReactNode;
};

function PagerButton({ label, disabled, onClick, children }: PagerButtonProps) {
	return (
		<button
			type="button"
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
			className={cn(
				"flex h-8 w-8 items-center justify-center rounded-field border border-line bg-panel text-muted",
				disabled ? "text-line" : "hover:border-brand hover:text-brand-ink",
			)}
		>
			{children}
		</button>
	);
}

type StatementBodyProps = {
	error: unknown;
	data: StatementView | undefined;
	isPending: boolean;
	onClose: () => void;
};

function StatementBody({
	error,
	data,
	isPending,
	onClose,
}: StatementBodyProps) {
	if (isNotGranted(error)) {
		return (
			<EmptyState
				title="Comissões restritas ao seu perfil"
				description="Nesta clínica o acesso ao módulo de comissionamento é concedido usuário a usuário, e o seu ainda não recebeu. Peça a quem gerencia a clínica para liberar."
			/>
		);
	}

	if (error) {
		return (
			<div className="p-5">
				<Callout tone="danger">{messageOf(error)}</Callout>
			</div>
		);
	}

	const rows = data?.commissions ?? [];

	return (
		<>
			<div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
				<div className="flex flex-col gap-1">
					<span className="text-[11.5px] text-muted">Total do mês</span>
					<span className="text-[20px] font-semibold text-ink tabular-nums">
						{money(data?.total)}
					</span>
				</div>
				<div className="flex items-center gap-3">
					{data?.closed ? (
						<Badge tone="brand">Mês fechado</Badge>
					) : (
						<Badge tone="warn">Em aberto</Badge>
					)}
					<Button
						variant="secondary"
						disabled={isPending || data?.closed || rows.length === 0}
						onClick={onClose}
					>
						Fechar mês
					</Button>
				</div>
			</div>

			<DataTable
				columns={COLUMNS}
				rows={rows}
				rowId={(commission) => String(commission.id)}
				isPending={isPending}
				pendingLabel="Carregando comissões…"
				pageSize={12}
				empty={
					<EmptyState
						title="Nenhuma comissão neste mês"
						description="A comissão nasce quando um atendimento é faturado, e só conta para o profissional que tem percentual definido. Confira os percentuais abaixo."
					/>
				}
			/>
		</>
	);
}

function capitalized(label: string) {
	return label.charAt(0).toUpperCase() + label.slice(1);
}
