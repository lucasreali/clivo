import { CaretDown, CaretUp, CaretUpDown } from "@phosphor-icons/react";
import type {
	ColumnDef,
	Header,
	RowData,
	SortDirection,
} from "@tanstack/react-table";
import {
	createColumnHelper,
	createPaginatedRowModel,
	createSortedRowModel,
	metaHelper,
	rowPaginationFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_basic,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { Button } from "./Button";
import { cn } from "./cn";

type ColumnLayout = {
	width?: string;
	align?: "right" | "center";
};

const FEATURES = tableFeatures({
	rowPaginationFeature,
	rowSortingFeature,
	paginatedRowModel: createPaginatedRowModel(),
	sortedRowModel: createSortedRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		basic: sortFn_basic,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
	columnMeta: metaHelper<ColumnLayout>(),
});

const UNPAGED = Number.MAX_SAFE_INTEGER;

const HEAD_CELL =
	"border-b border-line bg-surface px-4 py-2.5 text-left align-middle text-[11.5px] font-semibold tracking-[0.3px] text-muted uppercase";

const BODY_CELL = "border-b border-line px-4 py-3 text-left text-[13px]";

const ALIGNMENT = { right: "text-right", center: "text-center" } as const;

// The sort toggle is a flex button, which shrinks to its text and so ignores the
// cell's text-align. An aligned column has to push the button itself, or the
// header drifts away from the numbers underneath it.
const JUSTIFY = {
	right: "w-full justify-end",
	center: "w-full justify-center",
} as const;

const VERTICAL = { middle: "align-middle", top: "align-top" } as const;

const SORT_MARKS = { asc: CaretUp, desc: CaretDown } as const;

export type TableColumns<Row extends RowData> = ColumnDef<
	typeof FEATURES,
	Row
>[];

export function columnsFor<Row extends RowData>() {
	return createColumnHelper<typeof FEATURES, Row>();
}

type DataTableProps<Row extends RowData> = {
	columns: TableColumns<Row>;
	rows: readonly Row[];
	rowId: (row: Row) => string;
	empty?: React.ReactNode;
	isPending?: boolean;
	pendingLabel?: string;
	pageSize?: number;
	highlighted?: (row: Row) => boolean;
	verticalAlign?: keyof typeof VERTICAL;
};

export function DataTable<Row extends RowData>({
	columns,
	rows,
	rowId,
	empty,
	isPending = false,
	pendingLabel = "Carregando…",
	pageSize,
	highlighted,
	verticalAlign = "middle",
}: DataTableProps<Row>) {
	const table = useTable({
		features: FEATURES,
		columns,
		data: rows,
		getRowId: rowId,
		initialState: {
			pagination: { pageIndex: 0, pageSize: pageSize ?? UNPAGED },
		},
	});

	const pageCount = table.getPageCount();

	return (
		<>
			<table className="w-full table-fixed border-collapse">
				<colgroup>
					{table.getAllLeafColumns().map((column) => (
						<col
							key={column.id}
							style={{ width: column.columnDef.meta?.width }}
						/>
					))}
				</colgroup>

				<thead>
					{table.getHeaderGroups().map((group) => (
						<tr key={group.id}>
							{group.headers.map((header) => (
								<th
									key={header.id}
									scope="col"
									className={cn(
										HEAD_CELL,
										alignmentOf(header.column.columnDef.meta),
									)}
								>
									<SortToggle
										header={header}
										align={header.column.columnDef.meta?.align}
									>
										<table.FlexRender header={header} />
									</SortToggle>
								</th>
							))}
						</tr>
					))}
				</thead>

				<tbody className="[&>tr:last-child>td]:border-b-0">
					{table.getRowModel().rows.map((row) => (
						<tr
							key={row.id}
							className={cn(
								"hover:bg-row-hover",
								highlighted?.(row.original) && "bg-brand-soft/30",
							)}
						>
							{row.getAllCells().map((cell) => (
								<td
									key={cell.id}
									className={cn(
										BODY_CELL,
										VERTICAL[verticalAlign],
										alignmentOf(cell.column.columnDef.meta),
									)}
								>
									<table.FlexRender cell={cell} />
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			{isPending ? (
				<p className="m-0 px-4 py-10 text-center text-[12.5px] text-muted">
					{pendingLabel}
				</p>
			) : null}

			{!isPending && rows.length === 0 ? empty : null}

			{pageCount > 1 ? (
				<Pager
					page={`Página ${table.state.pagination.pageIndex + 1} de ${pageCount}`}
					onPrevious={
						table.getCanPreviousPage() ? () => table.previousPage() : undefined
					}
					onNext={table.getCanNextPage() ? () => table.nextPage() : undefined}
				/>
			) : null}
		</>
	);
}

type SortToggleProps<Row extends RowData> = {
	header: Header<typeof FEATURES, Row>;
	align?: ColumnLayout["align"];
	children: React.ReactNode;
};

function SortToggle<Row extends RowData>({
	header,
	align,
	children,
}: SortToggleProps<Row>) {
	if (header.isPlaceholder) {
		return null;
	}

	if (!header.column.getCanSort()) {
		return children;
	}

	return (
		<button
			type="button"
			onClick={header.column.getToggleSortingHandler()}
			className={cn(
				"flex items-center gap-1 hover:text-ink",
				align && JUSTIFY[align],
			)}
		>
			{children}
			<SortMark direction={header.column.getIsSorted()} />
		</button>
	);
}

function SortMark({ direction }: { direction: false | SortDirection }) {
	const Mark = direction ? SORT_MARKS[direction] : CaretUpDown;

	return (
		<Mark
			size={12}
			aria-hidden="true"
			className={direction ? "text-brand" : "text-faint"}
		/>
	);
}

type PagerProps = {
	page: string;
	onPrevious?: () => void;
	onNext?: () => void;
};

function Pager({ page, onPrevious, onNext }: PagerProps) {
	return (
		<div className="flex items-center justify-between border-t border-line px-4 py-2.5">
			<span className="text-[12px] text-muted">{page}</span>
			<div className="flex gap-1.5">
				<Button variant="ghost" disabled={!onPrevious} onClick={onPrevious}>
					Anterior
				</Button>
				<Button variant="ghost" disabled={!onNext} onClick={onNext}>
					Próxima
				</Button>
			</div>
		</div>
	);
}

function alignmentOf(meta: ColumnLayout | undefined) {
	return meta?.align ? ALIGNMENT[meta.align] : undefined;
}
