export type EventTone = "win" | "lose" | "info";

/** Evento di gioco da mostrare con un banner animato */
export interface GameEvent {
	id: number;
	text: string;
	tone: EventTone;
}

const MAX_EVENTS = 10;

/** Accoda un evento con id progressivo, mantenendo solo gli ultimi */
export function addEvent(
	events: GameEvent[],
	text: string,
	tone: EventTone = "info",
): GameEvent[] {
	const id = (events[events.length - 1]?.id ?? 0) + 1;
	return [...events, { id, text, tone }].slice(-MAX_EVENTS);
}
