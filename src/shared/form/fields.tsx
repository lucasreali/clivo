import type { AnyFieldApi } from "@tanstack/react-form";
import { Combobox } from "#/shared/ui/Combobox";
import { Checkbox, Field, TextArea, TextInput } from "#/shared/ui/Field";
import { NumberInput } from "#/shared/ui/NumberInput";
import type { Option } from "#/shared/ui/options";
import { Select } from "#/shared/ui/Select";
import { useFieldContext } from "./context";

type Issue = { message: string };

/**
 * The schema judges the whole draft at once, so leaving one field writes a
 * message onto every other one — including fields the typist has not reached,
 * whose message is about a value they have since changed. A message is only
 * current for a field the typist has left, and for every field once they have
 * tried to submit, from which point each keystroke re-judges the draft.
 */
function judged(field: AnyFieldApi) {
	return field.state.meta.isBlurred || field.form.state.submissionAttempts > 0;
}

function errorOf(field: AnyFieldApi) {
	if (!judged(field)) {
		return undefined;
	}

	const [issue]: Array<Issue | undefined> = field.state.meta.errors;
	return issue?.message;
}

type LabelledProps = {
	label: string;
	required?: boolean;
	hint?: string;
	disabled?: boolean;
};

type TextFieldProps = LabelledProps & {
	type?: React.HTMLInputTypeAttribute;
	inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
	autoComplete?: string;
	placeholder?: string;
	maxLength?: number;
	/** Rewrites what the typist sees on every keystroke, e.g. a CPF mask. */
	mask?: (value: string) => string;
};

export function TextField({
	label,
	required,
	hint,
	disabled,
	mask,
	...input
}: TextFieldProps) {
	const field = useFieldContext<string>();
	const error = errorOf(field);

	return (
		<Field label={label} required={required} hint={hint} error={error}>
			{(id) => (
				<TextInput
					{...input}
					id={id}
					name={field.name}
					disabled={disabled}
					value={field.state.value ?? ""}
					onBlur={field.handleBlur}
					onChange={(event) =>
						field.handleChange(
							mask ? mask(event.target.value) : event.target.value,
						)
					}
					aria-invalid={Boolean(error)}
				/>
			)}
		</Field>
	);
}

type NumberFieldProps = LabelledProps & {
	min?: number;
	max?: number;
	step?: number;
	placeholder?: string;
};

export function NumberField({
	label,
	required,
	hint,
	disabled,
	...input
}: NumberFieldProps) {
	const field = useFieldContext<string>();
	const error = errorOf(field);

	return (
		<Field label={label} required={required} hint={hint} error={error}>
			{(id) => (
				<NumberInput
					{...input}
					id={id}
					name={field.name}
					disabled={disabled}
					value={field.state.value ?? ""}
					onBlur={field.handleBlur}
					onChange={field.handleChange}
					aria-invalid={Boolean(error)}
				/>
			)}
		</Field>
	);
}

type TextAreaFieldProps = LabelledProps & {
	maxLength?: number;
	placeholder?: string;
};

export function TextAreaField({
	label,
	required,
	hint,
	disabled,
	...input
}: TextAreaFieldProps) {
	const field = useFieldContext<string>();
	const error = errorOf(field);

	return (
		<Field label={label} required={required} hint={hint} error={error}>
			{(id) => (
				<TextArea
					{...input}
					id={id}
					name={field.name}
					disabled={disabled}
					value={field.state.value ?? ""}
					onBlur={field.handleBlur}
					onChange={(event) => field.handleChange(event.target.value)}
					aria-invalid={Boolean(error)}
				/>
			)}
		</Field>
	);
}

type SelectFieldProps = LabelledProps & {
	options: readonly Option[];
	placeholder?: string;
};

export function SelectField({
	label,
	required,
	hint,
	disabled,
	...select
}: SelectFieldProps) {
	const field = useFieldContext<string>();
	const error = errorOf(field);

	return (
		<Field label={label} required={required} hint={hint} error={error}>
			{(id) => (
				<Select
					{...select}
					id={id}
					name={field.name}
					disabled={disabled}
					value={field.state.value ?? ""}
					onBlur={field.handleBlur}
					onChange={field.handleChange}
					aria-invalid={Boolean(error)}
				/>
			)}
		</Field>
	);
}

type CheckboxFieldProps = {
	label: React.ReactNode;
	disabled?: boolean;
};

export function CheckboxField({ label, disabled }: CheckboxFieldProps) {
	const field = useFieldContext<boolean>();
	const error = errorOf(field);

	return (
		<div className="flex flex-col gap-1.5">
			<Checkbox
				name={field.name}
				disabled={disabled}
				checked={Boolean(field.state.value)}
				onBlur={field.handleBlur}
				onCheckedChange={(checked) => field.handleChange(checked)}
				label={label}
			/>
			{error ? (
				<span className="text-[11.5px] text-danger">{error}</span>
			) : null}
		</div>
	);
}

type ComboboxFieldProps = LabelledProps & {
	options: readonly Option[];
	onSearch?: (term: string) => void;
	placeholder?: string;
	emptyMessage?: string;
	isLoading?: boolean;
};

export function ComboboxField({
	label,
	required,
	hint,
	disabled,
	...combobox
}: ComboboxFieldProps) {
	const field = useFieldContext<string>();
	const error = errorOf(field);

	return (
		<Field label={label} required={required} hint={hint} error={error}>
			{(id) => (
				<Combobox
					{...combobox}
					id={id}
					name={field.name}
					disabled={disabled}
					value={field.state.value ?? ""}
					onBlur={field.handleBlur}
					onChange={field.handleChange}
				/>
			)}
		</Field>
	);
}
