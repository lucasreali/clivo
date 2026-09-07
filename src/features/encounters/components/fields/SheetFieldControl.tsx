import type { SheetField } from "#/api/gen/types";
import { Checkbox, Field, TextArea, TextInput } from "#/shared/ui/Field";
import { Select } from "#/shared/ui/Select";
import { MarkedRegionsField } from "./MarkedRegionsField";

type SheetFieldControlProps = {
	field: SheetField;
	value: unknown;
	onChange: (value: unknown) => void;
};

/**
 * Variability mechanism B: the record template arrives as data, so the same
 * control renders a dental chart, a physiotherapy scale or a vet vital sign.
 */
export function SheetFieldControl({
	field,
	value,
	onChange,
}: SheetFieldControlProps) {
	const label = field.label ?? field.code ?? "";
	const options = field.options ?? [];

	if (field.fieldType === "ODONTOGRAM" || field.fieldType === "BODY_MAP") {
		return (
			<MarkedRegionsField
				label={label}
				regions={options}
				value={asChart(value)}
				onChange={onChange}
			/>
		);
	}

	if (field.fieldType === "BOOLEAN") {
		return (
			<Checkbox
				checked={value === true}
				onChange={(event) => onChange(event.target.checked)}
				label={label}
			/>
		);
	}

	if (field.fieldType === "MULTI_CHOICE") {
		return (
			<Field label={label} required={field.required}>
				{() => (
					<div className="flex flex-wrap gap-2">
						{options.map((option) => (
							<Checkbox
								key={option}
								checked={asList(value).includes(option)}
								onChange={(event) =>
									onChange(toggle(asList(value), option, event.target.checked))
								}
								label={option}
							/>
						))}
					</div>
				)}
			</Field>
		);
	}

	if (field.fieldType === "SINGLE_CHOICE" || field.fieldType === "SCALE") {
		return (
			<Field label={label} required={field.required}>
				{(id) => (
					<Select
						id={id}
						value={String(value ?? "")}
						onChange={onChange}
						options={[
							// An optional sheet field has to stay clearable once answered.
							...(field.required ? [] : [{ value: "", label: "Selecione" }]),
							...options.map((option) => ({
								value: option,
								label: option,
							})),
						]}
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
					type={inputTypeOf(field.fieldType)}
					value={String(value ?? "")}
					onChange={(event) => onChange(event.target.value)}
				/>
			)}
		</Field>
	);
}

function inputTypeOf(fieldType: string | undefined) {
	if (fieldType === "DATE") {
		return "date";
	}
	if (fieldType === "INTEGER" || fieldType === "DECIMAL") {
		return "number";
	}
	return "text";
}

function asChart(value: unknown): Record<string, string> {
	return typeof value === "object" && value !== null
		? (value as Record<string, string>)
		: {};
}

function asList(value: unknown): string[] {
	return Array.isArray(value) ? value.map(String) : [];
}

function toggle(items: string[], option: string, selected: boolean) {
	return selected
		? [...items, option]
		: items.filter((item) => item !== option);
}
