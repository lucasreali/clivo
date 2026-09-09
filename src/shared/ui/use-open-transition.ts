import { useEffect, useState } from "react";

/**
 * Base UI skips the enter transition of a popup that was already open on its first
 * render, and a caller that unmounts the component to close it takes the panel away
 * before it can leave. Opening a frame after mounting, and reporting the close only
 * once the exit has finished, gives both halves of the animation back to a component
 * the caller still mounts and unmounts.
 */
export function useOpenTransition(onClose: () => void) {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		setIsOpen(true);
	}, []);

	return {
		isOpen,
		close: () => setIsOpen(false),
		onSettled: (open: boolean) => {
			if (!open) {
				onClose();
			}
		},
	};
}
