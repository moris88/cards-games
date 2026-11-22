import { useEffect, useState } from "react";
import { type GameId, saveKey } from "./settings";
import { loadJson, removeJson, saveJson } from "./storage";

/**
 * Stato di gioco salvato automaticamente in localStorage.
 * Con `resume` riparte dal salvataggio; a partita finita il salvataggio viene rimosso.
 */
export function useSavedGame<T>(
	game: GameId,
	resume: boolean,
	create: () => T,
	isFinished: (state: T) => boolean,
) {
	const [state, setState] = useState<T>(
		() => (resume ? loadJson<T>(saveKey(game)) : null) ?? create(),
	);

	useEffect(() => {
		if (isFinished(state)) removeJson(saveKey(game));
		else saveJson(saveKey(game), state);
	}, [game, state, isFinished]);

	return [state, setState] as const;
}

export const hasSave = (game: GameId) => loadJson(saveKey(game)) !== null;
