import { useEffect, useState } from "react";
import type { GameEvent } from "../core/gameEvents";

const DISPLAY_MS = 1800;

/** Mostra gli eventi nuovi uno alla volta, in ordine */
export function useEventQueue(events: GameEvent[]): GameEvent | null {
	const [lastShown, setLastShown] = useState(
		() => events[events.length - 1]?.id ?? 0,
	);
	const [current, setCurrent] = useState<GameEvent | null>(null);

	useEffect(() => {
		if (current) {
			const timer = setTimeout(() => setCurrent(null), DISPLAY_MS);
			return () => clearTimeout(timer);
		}
		const next = events.find((e) => e.id > lastShown);
		if (next) {
			setLastShown(next.id);
			setCurrent(next);
		}
	}, [events, current, lastShown]);

	return current;
}
