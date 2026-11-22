import { useCallback, useState } from "react";
import { useSavedGame } from "../../core/useSavedGame";
import { useSolitaireTimer } from "../solitaire/useSolitaireTimer";
import {
	type ClockState,
	createClock,
	pileFor,
	placeCurrent,
} from "./clockLogic";

const isFinished = (s: ClockState) => s.phase !== "gioco";

export function useClock(resume: boolean) {
	const [state, setState] = useSavedGame(
		"orologio",
		resume,
		createClock,
		isFinished,
	);
	const [error, setError] = useState("");

	const tick = useCallback(
		() => setState((s) => ({ ...s, elapsed: s.elapsed + 1 })),
		[setState],
	);
	useSolitaireTimer(state.moves > 0 && state.phase === "gioco", tick);

	return {
		state,
		error,
		/** La carta trascinata va accettata solo dal mazzetto del suo valore */
		dropOn: (pileIndex: number) => {
			if (!state.current || pileIndex !== pileFor(state.current)) {
				setError("Mettila sotto il mazzetto del suo valore");
				return;
			}
			setError("");
			setState(placeCurrent);
		},
		restart: () => {
			setError("");
			setState(createClock());
		},
	};
}
