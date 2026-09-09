/** The dimmed canvas behind a modal or a drawer, fading with the panel it covers. */
export const SCRIM =
	"fixed inset-0 z-50 bg-ink/38 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0";

/** An anchored popup — menu, select, combobox — growing out of the control it belongs to. */
export const POPUP_MOTION =
	"origin-(--transform-origin) transition-[opacity,scale] duration-(--duration-popup) ease-pop data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0";

/**
 * A drawer panel following the swipe as it is dragged: the gesture moves it directly
 * (no transition to lag behind the finger) and a flick releases it at its own speed.
 */
export const DRAWER_MOTION =
	"transition-transform duration-(--duration-drawer) ease-drawer data-swiping:select-none data-swiping:duration-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*var(--duration-drawer))]";

/** The scrim of a drawer, thinning out as the panel is swiped away. */
export const DRAWER_SCRIM_MOTION =
	"opacity-[calc(1-var(--drawer-swipe-progress))] duration-(--duration-drawer) ease-drawer data-swiping:duration-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*var(--duration-drawer))]";
