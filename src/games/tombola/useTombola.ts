import { useEffect, useState } from "react";
import type { Difficulty } from "../../core/settings";
import { useSavedGame } from "../../core/useSavedGame";
import { type Cartella, createCartella, type Prize } from "./cartella";
import {
	createGame,
	drawNumber,
	humanClaim,
	startGame,
	type TombolaState,
	toggleMark,
	toSetup,
} from "./tombolaLogic";

const DRAW_INTERVAL_MS = 4000;
const OFFERED = 12;
const isFinished = (s: TombolaState) => s.phase === "fine";
const offer = () => Array.from({ length: OFFERED }, createCartella);

export function useTombola(
	names: string[],
	difficulty: Difficulty,
	resume: boolean,
) {
	const [state, setState] = useSavedGame(
		"tombola",
		resume,
		() => createGame(names),
		isFinished,
	);
	const [paused, setPaused] = useState(false);
	const [offered, setOffered] = useState<Cartella[]>(offer);
	const [chosen, setChosen] = useState<number[]>([]);

	// Estrazione automatica, sospesa con la pausa
	useEffect(() => {
		if (state.phase !== "gioco" || paused) return;
		const timer = setTimeout(
			() => setState((s) => drawNumber(s, difficulty)),
			DRAW_INTERVAL_MS,
		);
		return () => clearTimeout(timer);
	}, [state, paused, difficulty, setState]);

	return {
		state,
		paused,
		offered,
		chosen,
		togglePause: () => setPaused((p) => !p),
		drawNow: () => setState((s) => drawNumber(s, difficulty)),
		toggleChoice: (i: number) =>
			setChosen((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i])),
		regenerate: () => {
			setOffered(offer());
			setChosen([]);
		},
		start: () =>
			setState((s) =>
				startGame(
					s,
					chosen.map((i) => offered[i]),
				),
			),
		mark: (key: string) => setState((s) => toggleMark(s, key)),
		claim: (prize: Prize) => setState((s) => humanClaim(s, prize)),
		newGame: () => {
			setChosen([]);
			setOffered(offer());
			setState(toSetup);
		},
	};
}
