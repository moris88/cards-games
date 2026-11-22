import { useCallback, useEffect, useState } from "react";
import { useSavedGame } from "../../core/useSavedGame";
import {
	autoStep,
	canAutoComplete,
	createKlondike,
	type DrawCount,
	drawStock,
	type KlondikeState,
	moveCards,
	sendToFoundation,
	undo,
} from "./klondikeLogic";
import type { Location } from "./solitaireRules";
import { useSolitaireTimer } from "./useSolitaireTimer";

const AUTO_STEP_MS = 140;
const isFinished = (s: KlondikeState) => s.won;

export function useKlondike(drawCount: DrawCount, resume: boolean) {
	const [state, setState] = useSavedGame(
		"solitario",
		resume,
		() => createKlondike(drawCount),
		isFinished,
	);
	const [autoPlaying, setAutoPlaying] = useState(false);

	const tick = useCallback(
		() => setState((s) => ({ ...s, elapsed: s.elapsed + 1 })),
		[setState],
	);
	useSolitaireTimer(state.moves > 0 && !state.won, tick);

	// Completamento automatico: una carta alla volta, per vederle volare
	useEffect(() => {
		if (!autoPlaying) return;
		const next = autoStep(state);
		if (!next) {
			setAutoPlaying(false);
			return;
		}
		const timer = setTimeout(() => setState(next), AUTO_STEP_MS);
		return () => clearTimeout(timer);
	}, [autoPlaying, state, setState]);

	/** Applica una mossa solo se valida */
	const apply = (fn: (s: KlondikeState) => KlondikeState | null) =>
		setState((s) => fn(s) ?? s);

	return {
		state,
		canAutoComplete: canAutoComplete(state) && !autoPlaying,
		draw: () => setState(drawStock),
		move: (from: Location, to: { kind: Location["kind"]; index: number }) =>
			apply((s) => moveCards(s, from, to)),
		toFoundation: (from: Location) => apply((s) => sendToFoundation(s, from)),
		undo: () => setState(undo),
		autoComplete: () => setAutoPlaying(true),
		restart: () => {
			setAutoPlaying(false);
			setState(createKlondike(drawCount));
		},
	};
}
