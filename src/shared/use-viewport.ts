import { useSyncExternalStore } from "react";

const COMPACT_VIEWPORT = "(max-width: 767px)";

export function useIsCompactViewport() {
	return useSyncExternalStore(
		watchCompactViewport,
		isCompactViewport,
		onServer,
	);
}

function watchCompactViewport(notify: () => void) {
	const query = window.matchMedia(COMPACT_VIEWPORT);
	query.addEventListener("change", notify);
	return () => query.removeEventListener("change", notify);
}

function isCompactViewport() {
	return window.matchMedia(COMPACT_VIEWPORT).matches;
}

function onServer() {
	return false;
}
