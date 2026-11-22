import { useEffect } from "react";
import type { Difficulty } from "../../core/settings";
import { useSavedGame } from "../../core/useSavedGame";
import {
	type BriscolaState,
	cpuChoose,
	createGame,
	playCard,
	resolveTrick,
} from "./briscolaLogic";

const CPU_DELAY_MS = 900;
const TRICK_DELAY_MS = 1300;
const isFinished = (s: BriscolaState) => s.phase === "fine";

export function useBriscola(
	cpuName: string,
	difficulty: Difficulty,
	resume: boolean,
) {
	const [state, setState] = useSavedGame(
		"briscola",
		resume,
		() => createGame(cpuName),
		isFinished,
	);

	useEffect(() => {
		let action: ((s: BriscolaState) => BriscolaState) | null = null;
		let delay = CPU_DELAY_MS;
		if (state.phase === "presa") {
			action = resolveTrick;
			delay = TRICK_DELAY_MS;
		} else if (state.phase === "gioco" && state.turn === 1) {
			action = (s) => playCard(s, cpuChoose(s, difficulty));
		}
		if (!action) return;
		const run = action;
		const timer = setTimeout(() => setState(run), delay);
		return () => clearTimeout(timer);
	}, [state, difficulty, setState]);

	return {
		state,
		canPlay: state.phase === "gioco" && state.turn === 0,
		play: (cardId: string) => setState((s) => playCard(s, cardId)),
		restart: () => setState(createGame(cpuName)),
	};
}
