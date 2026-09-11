import type { RecordValue, SheetField } from "#/api/gen/types";
import { Field, TextArea, TextInput } from "#/shared/ui/Field";
import { NumberInput } from "#/shared/ui/NumberInput";
import { Select } from "#/shared/ui/Select";
import { MarkedRegionsField } from "./MarkedRegionsField";

type SheetFieldControlProps = {
	field: SheetField;
	value: RecordValue | undefined;
	disabled: boolean;
	onChange: (value: RecordValue) => void;
};

const NUMERIC = ["INTEGER", "DECIMAL", "SCALE"];

/**
 * Variability mechanism B: the record template arrives as data, so the same
 * control renders a dental chart, a physiotherapy scale or a vet vital sign.
 */
export function SheetFieldControl({
	field,
	value,
	disabled,
	onChange,
}: SheetFieldControlProps) {
	const label = field.label ?? field.code ?? "";
	const options = field.options ?? [];

	if (field.descriptor) {
		return (
			<MarkedRegionsField
				field={field}
				value={value}
				disabled={disabled}
				onChange={onChange}
			/>
		);
	}

	if (options.length > 0) {
		return (
			<Field label={label} required={field.required}>
				{(id) => (
					<Select
						id={id}
						disabled={disabled}
						value={String(value ?? "")}
						onChange={onChange}
						options={[
							// An optional sheet field has to stay clearable once answered.
							...(field.required ? [] : [{ value: "", label: "Select" }]),
							...options.map((option) => ({ value: option, label: option })),
						]}
					/>
				)}
			</Field>
		);
	}

	if (NUMERIC.includes(field.fieldType ?? "")) {
		return (
			<Field label={label} required={field.required}>
				{(id) => (
					<NumberInput
						id={id}
						disabled={disabled}
						step={field.fieldType === "DECIMAL" ? 0.01 : 1}
						value={String(value ?? "")}
						onChange={onChange}
					/>
				)}
			</Field>
		);
	}

	if (field.fieldType === "LONG_TEXT") {
		return (
			<Field label={label} required={field.required}>
				{(id) => (
					<TextArea
						id={id}
						disabled={disabled}
						value={String(value ?? "")}
						onChange={(event) => onChange(event.target.value)}
					/>
				)}
			</Field>
		);
	}

	return (
		<Field label={label} required={field.required}>
			{(id) => (
				<TextInput
					id={id}
					disabled={disabled}
					type={field.fieldType === "DATE" ? "date" : "text"}
					value={String(value ?? "")}
					onChange={(event) => onChange(event.target.value)}
				/>
			)}
		</Field>
	);
}
