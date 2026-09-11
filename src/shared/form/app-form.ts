import {
	type AnyFormApi,
	createFormHook,
	revalidateLogic,
	type StandardSchemaV1,
	useStore,
} from "@tanstack/react-form";
import { fieldContext, formContext } from "./context";
import {
	CheckboxField,
	ComboboxField,
	NumberField,
	SelectField,
	TextAreaField,
	TextField,
} from "./fields";

export const { useAppForm, withForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
		TextAreaField,
		NumberField,
		SelectField,
		CheckboxField,
		ComboboxField,
	},
	formComponents: {},
});

/**
 * A field is only judged once the typist has left it; from the first submit
 * attempt on, every keystroke re-checks it.
 */
export function validatedBy<TSchema extends StandardSchemaV1>(schema: TSchema) {
	return {
		validationLogic: revalidateLogic({
			mode: "blur",
			modeAfterSubmission: "change",
		}),
		validators: { onDynamic: schema },
	};
}

export function submitHandler(form: AnyFormApi) {
	return (event: React.FormEvent) => {
		event.preventDefault();
		form.handleSubmit();
	};
}

export function useIsDirty(form: AnyFormApi) {
	return useStore(form.store, (state) => state.isDirty);
}
