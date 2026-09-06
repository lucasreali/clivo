import type { ParameterView } from "#/api/gen/types";
import {
	editorFor,
	itemsAsValue,
	selectedItems,
} from "#/features/capabilities/model/parameter-editor";
import { Checkbox, Field, Select, TextInput } from "#/shared/ui/Field";

type ParameterControlProps = {
	parameter: ParameterView;
	value: string;
	onChange: (value: string) => void;
};

export function ParameterControl({
	parameter,
	value,
	onChange,
}: ParameterControlProps) {
	const editor = editorFor(parameter.accepts);
	const label = parameter.name ?? parameter.code ?? "";

	if (editor.kind === "flag") {
		return (
			<Checkbox
				checked={value === "true"}
				onChange={(event) => onChange(String(event.target.checked))}
				label={label}
			/>
		);
	}

	if (editor.kind === "multiChoice") {
		const items = selectedItems(value);

		return (
			<Field label={label} hint={parameter.accepts}>
				{() => (
					<div className="flex flex-wrap gap-3">
						{editor.options.map((option) => (
							<Checkbox
								key={option}
								checked={items.includes(option)}
								onChange={(event) =>
									onChange(
										itemsAsValue(toggle(items, option, event.target.checked)),
									)
								}
								label={option}
							/>
						))}
					</div>
				)}
			</Field>
		);
	}

	if (editor.kind === "choice") {
		return (
			<Field label={label} hint={parameter.accepts}>
				{(id) => (
					<Select
						id={id}
						value={value}
						onChange={(event) => onChange(event.target.value)}
					>
						{editor.options.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</Select>
				)}
			</Field>
		);
	}

	if (editor.kind === "number") {
		return (
			<Field label={label} hint={parameter.accepts}>
				{(id) => (
					<TextInput
						id={id}
						type="number"
						min={editor.min}
						max={editor.max}
						step={editor.integer ? 1 : 0.01}
						value={value}
						onChange={(event) => onChange(event.target.value)}
					/>
				)}
			</Field>
		);
	}

	return (
		<Field label={label} hint={parameter.accepts}>
			{(id) => (
				<TextInput
					id={id}
					value={value}
					onChange={(event) => onChange(event.target.value)}
				/>
			)}
		</Field>
	);
}

function toggle(items: string[], option: string, selected: boolean) {
	return selected
		? [...items, option]
		: items.filter((item) => item !== option);
}
