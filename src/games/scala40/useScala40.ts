import { useEffect, useState } from "react";
import { playCpuTurn } from "./scala40Ai";
import {
	attach,
	cancelOpening,
	confirmOpening,
	createGame,
	dealRound,
	discardCard,
	drawFromDeck,
	drawFromDiscard,
	meld,
	type S40State,
} from "./scala40Logic";

const CPU_DELAY_MS = 1200;

export function useScala40(cpuCount: number) {
	const [state, setState] = useState<S40State>(() => createGame(cpuCount));
	const [selected, setSelected] = useState<string[]>([]);
	const [error, setError] = useState("");

	const player = state.players[state.current];
	const isCpuTurn =
		!player.isHuman && (state.phase === "pesca" || state.phase === "gioco");
	const human = state.players[0];
	const selectedCards = human.hand.filter((c) => selected.includes(c.id));

	// state tra le dipendenze: il timer riparte anche tra due CPU consecutive
	// biome-ignore lint/correctness/useExhaustiveDependencies: dipendenza voluta
	useEffect(() => {
		if (!isCpuTurn) return;
		const timer = setTimeout(() => setState(playCpuTurn), CPU_DELAY_MS);
		return () => clearTimeout(timer);
	}, [isCpuTurn, state]);

	/** Applica un'azione: se restituisce un errore lo mostra, altrimenti aggiorna lo stato */
	const run = (result: S40State | string) => {
		if (typeof result === "string") {
			setError(result);
			return;
		}
		setError("");
		setSelected([]);
		setState(result);
	};

	return {
		state,
		selected,
		error,
		isHumanTurn: player.isHuman && !isCpuTurn,
		toggle: (id: string) =>
			setSelected((s) =>
				s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
			),
		drawDeck: () => run(drawFromDeck(state)),
		drawDiscard: () => run(drawFromDiscard(state)),
		meld: () => run(meld(state, selectedCards)),
		attach: (meldId: number) => run(attach(state, meldId, selectedCards)),
		confirmOpening: () => run(confirmOpening(state)),
		cancelOpening: () => run(cancelOpening(state)),
		discard: () =>
			selectedCards.length === 1
				? run(discardCard(state, selectedCards[0].id))
				: setError("Seleziona una sola carta da scartare"),
		nextRound: () => run(dealRound(state)),
		restart: () => run(createGame(cpuCount)),
	};
}
