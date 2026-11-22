import { ActionButton } from "../../components/ActionButton";
import { EventOverlay } from "../../components/EventOverlay";
import { FrenchCardView } from "../../components/FrenchCardView";
import { Table } from "../../components/Table";
import { DraggableCard } from "./DraggableCard";
import { type DrawCount, drawCountOf } from "./klondikeLogic";
import { PileSlot } from "./PileSlot";
import { SolitaireBar } from "./SolitaireBar";
import { dropId } from "./solitaireRules";
import { TableauColumn } from "./TableauColumn";
import { useKlondike } from "./useKlondike";

interface KlondikeProps {
	drawCount: DrawCount;
	resume: boolean;
	onExit: () => void;
}

const SUIT_HINTS = ["♥", "♦", "♣", "♠"];

export function Klondike({ drawCount, resume, onExit }: KlondikeProps) {
	const game = useKlondike(drawCount, resume);
	const { state } = game;
	// Con "gira 3" si vedono le ultime tre carte del pozzo a ventaglio
	const visibleWaste = state.waste.slice(-drawCountOf(state));

	return (
		<Table title={`Solitario · gira ${drawCountOf(state)}`} onExit={onExit}>
			<EventOverlay events={state.events} />
			<SolitaireBar
				elapsed={state.elapsed}
				moves={state.moves}
				score={state.score}
				onUndo={game.undo}
				canUndo={state.history.length > 0 && !state.won}
			>
				{game.canAutoComplete && (
					<ActionButton onClick={game.autoComplete}>Completa</ActionButton>
				)}
				<ActionButton onClick={game.restart}>Nuova partita</ActionButton>
			</SolitaireBar>

			<div className="mx-auto flex flex-col gap-6">
				<div className="flex justify-between gap-3">
					<div className="flex gap-3">
						<PileSlot label="↻" onClick={game.draw}>
							{state.stock.length > 0 && (
								<FrenchCardView
									card={state.stock[state.stock.length - 1]}
									faceDown
									onClick={game.draw}
								/>
							)}
						</PileSlot>
						<div className="flex h-30 w-32">
							{visibleWaste.map((card, i) => {
								const top = i === visibleWaste.length - 1;
								return (
									<div key={card.id} className={i > 0 ? "-ml-14" : ""}>
										<DraggableCard
											card={card}
											draggable={top}
											onDrop={(to) => game.move({ kind: "waste" }, to)}
											onDoubleClick={
												top
													? () => game.toFoundation({ kind: "waste" })
													: undefined
											}
										/>
									</div>
								);
							})}
						</div>
					</div>
					<div className="flex gap-3">
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

				<div className="flex justify-between gap-3">
					{state.tableau.map((cards, index) => (
						<TableauColumn
							// biome-ignore lint/suspicious/noArrayIndexKey: le sette colonne sono fisse
							key={index}
							index={index}
							cards={cards}
							faceDownCount={state.faceDown[index]}
							canDrag={() => !state.won}
							onDrop={(cardIndex, to) =>
								game.move({ kind: "tableau", index, cardIndex }, to)
							}
							onDoubleClick={(cardIndex) =>
								game.toFoundation({ kind: "tableau", index, cardIndex })
							}
						/>
					))}
				</div>
			</div>
		</Table>
	);
}
