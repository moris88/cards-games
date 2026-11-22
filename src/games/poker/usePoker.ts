import { useEffect } from "react";
import type { Difficulty } from "../../core/settings";
import { useSavedGame } from "../../core/useSavedGame";
import { decide } from "./pokerAi";
import {
	act,
	createGame,
	type PokerAction,
	type PokerState,
	startHand,
} from "./pokerLogic";

const CPU_DELAY_MS = 1100;
const isFinished = (s: PokerState) => s.phase === "finePartita";

export function usePoker(
	names: string[],
	difficulty: Difficulty,
	resume: boolean,
) {
	const [state, setState] = useSavedGame(
		"poker",
		resume,
		() => createGame(names),
		isFinished,
	);
	const current = state.players[state.current];
	const cpuTurn = state.phase === "gioco" && !current.isHuman;

	// state tra le dipendenze: il timer riparte anche tra due CPU consecutive
	// biome-ignore lint/correctness/useExhaustiveDependencies: dipendenza voluta
	useEffect(() => {
		if (!cpuTurn) return;
		const timer = setTimeout(
			() => setState((s) => act(s, decide(s, difficulty))),
			CPU_DELAY_MS,
		);
		return () => clearTimeout(timer);
	}, [cpuTurn, state, difficulty, setState]);

	return {
		state,
		isHumanTurn: state.phase === "gioco" && current.isHuman,
		act: (action: PokerAction) => setState((s) => act(s, action)),
		nextHand: () => setState(startHand),
		restart: () => setState(createGame(names)),
	};
}
