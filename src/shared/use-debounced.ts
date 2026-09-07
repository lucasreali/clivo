import { useEffect, useState } from "react";

/**
 * Holds back a value that changes on every keystroke, so a search that reaches
 * the API waits for the typist to pause.
 */
export function useDebounced<T>(value: T, delay = 250) {
	const [settled, setSettled] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setSettled(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return settled;
}
