export type EventTone = "win" | "lose" | "info";
export type Mood = "neutral" | "thinking" | "happy" | "sad";

/** Evento di gioco da mostrare con un banner animato */
export interface GameEvent {
	id: number;
	text: string;
	tone: EventTone;
	/** Reazione degli avversari, per nome del giocatore */
	moods?: Record<string, Mood>;
}

const MAX_EVENTS = 10;

/** Accoda un evento con id progressivo, mantenendo solo gli ultimi */
export function addEvent(
	events: GameEvent[],
	text: string,
	tone: EventTone = "info",
	moods?: Record<string, Mood>,
): GameEvent[] {
	const id = (events[events.length - 1]?.id ?? 0) + 1;
	return [...events, { id, text, tone, moods }].slice(-MAX_EVENTS);
}

/** Umore di un avversario: pensa nel suo turno, altrimenti reagisce all'ultimo evento */
export function moodOf(
	name: string,
	events: GameEvent[],
	active: boolean,
): Mood {
	if (active) return "thinking";
	return events[events.length - 1]?.moods?.[name] ?? "neutral";
}
