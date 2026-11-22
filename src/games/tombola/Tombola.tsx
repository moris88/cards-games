import { ActionButton } from "../../components/ActionButton";
import { EventOverlay } from "../../components/EventOverlay";
import { Opponent } from "../../components/Opponent";
import { Table } from "../../components/Table";
import type { Difficulty } from "../../core/settings";
import { CartellaView } from "./CartellaView";
import { PRIZE_SHARE, PRIZES } from "./cartella";
import { DrawnBall } from "./DrawnBall";
import { Tabellone } from "./Tabellone";
import { TombolaSetup } from "./TombolaSetup";
import { markKey } from "./tombolaLogic";
import { useTombola } from "./useTombola";

interface TombolaProps {
	names: string[];
	difficulty: Difficulty;
	resume: boolean;
	onExit: () => void;
}

export function Tombola({ names, difficulty, resume, onExit }: TombolaProps) {
	const game = useTombola(names, difficulty, resume);
	const { state } = game;
	const human = state.players[0];
	const playing = state.phase === "gioco";
	const last = state.drawn[state.drawn.length - 1];

	return (
		<Table title="Tombola" onExit={onExit}>
			<EventOverlay events={state.events} />
			<div className="flex flex-wrap justify-center gap-3">
				{state.players.slice(1).map((p, i) => (
					<Opponent
						key={p.name}
						name={p.name}
						seed={i + 1}
						active={false}
						events={state.events}
						info={`fiches ${p.chips}${p.cards.length ? ` · ${p.cards.length} cartelle` : ""}`}
					>
						<div className="flex max-w-56 flex-wrap justify-center gap-1">
							{p.cards.map((card, ci) => (
								<CartellaView
									// biome-ignore lint/suspicious/noArrayIndexKey: cartelle fisse per partita
									key={ci}
									card={card}
									compact
									isMarked={(n) => state.drawn.includes(n)}
								/>
							))}
						</div>
					</Opponent>
				))}
			</div>

			{state.phase === "scelta" ? (
				<TombolaSetup
					offered={game.offered}
					chosen={game.chosen}
					chips={human.chips}
					onToggle={game.toggleChoice}
					onRegenerate={game.regenerate}
					onStart={game.start}
				/>
			) : (
				<>
					<div className="flex flex-wrap items-center justify-center gap-6">
						<DrawnBall number={last} paused={game.paused || !playing} />
						<Tabellone drawn={state.drawn} />
					</div>

					<div className="flex flex-col items-center gap-2">
						<p className="rounded bg-black/30 px-4 py-1">
							Piatto {state.pot} · estratti {state.drawn.length}/90 · le tue
							fiches {human.chips}
						</p>
						<div className="flex flex-wrap justify-center gap-2">
							{playing && (
								<>
									<ActionButton onClick={game.togglePause}>
										{game.paused ? "▶ Riprendi" : "⏸ Pausa"}
									</ActionButton>
									{game.paused && (
										<ActionButton onClick={game.drawNow}>Estrai</ActionButton>
									)}
								</>
							)}
							{state.phase === "fine" && (
								<ActionButton onClick={game.newGame}>
									Nuova partita
								</ActionButton>
							)}
						</div>
						<div className="flex flex-wrap justify-center gap-2">
							{PRIZES.map((prize) => {
								const winner = state.awarded[prize];
								return (
									<button
										key={prize}
										type="button"
										disabled={!playing || winner !== undefined}
										onClick={() => game.claim(prize)}
										className="rounded-full border-4 border-yellow-200 bg-red-600 px-3 py-1.5 text-sm font-black uppercase sm:px-5 sm:py-2 sm:text-base shadow-lg hover:bg-red-500 disabled:border-slate-400 disabled:bg-slate-600 disabled:opacity-70"
									>
										{prize}
										<span className="block text-xs font-normal normal-case">
											{winner !== undefined
												? `a ${state.players[winner].name}`
												: `${Math.floor(state.pot * PRIZE_SHARE[prize])} fiches`}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className="flex flex-wrap justify-center gap-3">
						{human.cards.map((card, ci) => (
							<CartellaView
								// biome-ignore lint/suspicious/noArrayIndexKey: cartelle fisse per partita
								key={ci}
								card={card}
								isMarked={(n) => human.marks.includes(markKey(ci, n))}
								onCell={playing ? (n) => game.mark(markKey(ci, n)) : undefined}
							/>
						))}
					</div>
				</>
			)}
		</Table>
	);
}
