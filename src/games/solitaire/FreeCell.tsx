import { useState } from "react";
import { ActionButton } from "../../components/ActionButton";
import { EventOverlay } from "../../components/EventOverlay";
import { Table } from "../../components/Table";
import { DraggableCard } from "./DraggableCard";
import { MAX_DEAL, randomDeal } from "./freecellLogic";
import { PileSlot } from "./PileSlot";
import { SolitaireBar } from "./SolitaireBar";
import { dropId, isSequence } from "./solitaireRules";
import { TableauColumn } from "./TableauColumn";
import { useFreeCell } from "./useFreeCell";

interface FreeCellProps {
	resume: boolean;
	onExit: () => void;
}

const SUIT_HINTS = ["♥", "♦", "♣", "♠"];

export function FreeCell({ resume, onExit }: FreeCellProps) {
	const game = useFreeCell(resume);
	const { state } = game;
	const [dealInput, setDealInput] = useState("");

	const chooseDeal = () => {
		const n = Number(dealInput);
		if (Number.isInteger(n) && n >= 1 && n <= MAX_DEAL) game.newDeal(n);
	};

	return (
		<Table title={`FreeCell · partita #${state.dealNumber}`} onExit={onExit}>
			<EventOverlay events={state.events} />
			<SolitaireBar
				elapsed={state.elapsed}
				moves={state.moves}
				onUndo={game.undo}
				canUndo={state.history.length > 0 && !state.won}
			>
				<ActionButton onClick={game.restart}>Ricomincia</ActionButton>
				<ActionButton onClick={() => game.newDeal(randomDeal())}>
					Partita casuale
				</ActionButton>
				<input
					type="number"
					min={1}
					max={MAX_DEAL}
					value={dealInput}
					onChange={(e) => setDealInput(e.target.value)}
					placeholder="N° partita"
					aria-label="Numero di partita"
					className="w-28 rounded bg-slate-800 px-2 py-1"
				/>
				<ActionButton onClick={chooseDeal}>Gioca</ActionButton>
			</SolitaireBar>

			<div className="solitaire-8 mx-auto flex flex-col gap-3 sm:gap-6">
				<div className="flex justify-between gap-1 sm:gap-6">
					<div className="flex gap-1 sm:gap-2">
						{state.cells.map((card, index) => (
							<PileSlot
								// biome-ignore lint/suspicious/noArrayIndexKey: le quattro celle sono fisse
								key={index}
								drop={dropId("cell", index)}
							>
								{card && (
									<DraggableCard
										card={card}
										draggable
										onDrop={(to) => game.move({ kind: "cell", index }, to)}
										onDoubleClick={() =>
											game.quickMove({ kind: "cell", index })
										}
									/>
								)}
							</PileSlot>
						))}
					</div>
					<div className="flex gap-1 sm:gap-2">
						{state.foundations.map((pile, index) => {
							const top = pile[pile.length - 1];
							return (
								<PileSlot
									// biome-ignore lint/suspicious/noArrayIndexKey: le quattro fondazioni sono fisse
									key={index}
									drop={dropId("foundation", index)}
									label={SUIT_HINTS[index]}
								>
									{top && (
										<DraggableCard
											card={top}
											draggable
											onDrop={(to) =>
												game.move({ kind: "foundation", index }, to)
											}
										/>
									)}
								</PileSlot>
							);
						})}
					</div>
				</div>

				<div className="flex justify-between gap-1 sm:gap-2">
					{state.tableau.map((cards, index) => (
						<TableauColumn
							// biome-ignore lint/suspicious/noArrayIndexKey: le otto colonne sono fisse
							key={index}
							index={index}
							cards={cards}
							canDrag={(cardIndex) =>
								!state.won && isSequence(cards.slice(cardIndex))
							}
							onDrop={(cardIndex, to) =>
								game.move({ kind: "tableau", index, cardIndex }, to)
							}
							onDoubleClick={(cardIndex) =>
								game.quickMove({ kind: "tableau", index, cardIndex })
							}
						/>
					))}
				</div>
			</div>
		</Table>
	);
}
