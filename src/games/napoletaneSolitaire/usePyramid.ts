import { useCallback, useState } from "react";
import type { NeapolitanCard } from "../../core/deck";
import { useSavedGame } from "../../core/useSavedGame";
import { useSolitaireTimer } from "../solitaire/useSolitaireTimer";
import {
	cardValue,
	createPyramid,
	drawStock,
	type PyramidState,
	removeCards,
	undo,
} from "./pyramidLogic";

const isFinished = (s: PyramidState) => s.won;

export function usePyramid(resume: boolean) {
	const [state, setState] = useSavedGame(
		"piramide",
		resume,
		createPyramid,
		isFinished,
	);
	const [selected, setSelected] = useState<string | null>(null);

	const tick = useCallback(
		() => setState((s) => ({ ...s, elapsed: s.elapsed + 1 })),
		[setState],
	);
	useSolitaireTimer(state.moves > 0 && !state.won && !state.stuck, tick);

	/** Clic su una carta giocabile: il Re si elimina da solo, le altre in coppia */
	const pick = (card: NeapolitanCard) => {
		if (cardValue(card) === 10) {
			setSelected(null);
			setState((s) => removeCards(s, [card.id]) ?? s);
			return;
		}
		if (!selected || selected === card.id) {
			setSelected(selected === card.id ? null : card.id);
			return;
		}
		const pair = [selected, card.id];
		setSelected(null);
		setState((s) => removeCards(s, pair) ?? s);
	};

	return {
		state,
		selected,
		pick,
		draw: () => {
			setSelected(null);
			setState(drawStock);
		},
		undo: () => {
			setSelected(null);
			setState(undo);
		},
		restart: () => {
			setSelected(null);
			setState(createPyramid());
		},
	};
}
