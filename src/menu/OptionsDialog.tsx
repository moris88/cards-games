import { useState } from "react";
import {
	DIFFICULTIES,
	type GameId,
	type Settings,
	SOLO_GAMES,
} from "../core/settings";
import { PlayersSettings } from "./PlayersSettings";
import { RULES } from "./rules";

interface OptionsDialogProps {
	settings: Settings;
	onChange: (settings: Settings) => void;
	onClose: () => void;
}

const GAME_IDS = Object.keys(RULES) as GameId[];

/** Opzioni: difficoltà per ogni gioco e regole */
export function OptionsDialog({
	settings,
	onChange,
	onClose,
}: OptionsDialogProps) {
	const [tab, setTab] = useState<GameId>("setteEMezzo");

	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
			<div className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-2xl border-4 border-amber-900 bg-felt-dark p-6 shadow-2xl">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold">⚙️ Opzioni e regole</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded bg-slate-700 px-3 py-1 hover:bg-slate-600"
					>
						Chiudi
					</button>
				</div>

				<PlayersSettings settings={settings} onChange={onChange} />

				<section className="flex flex-col gap-2">
					<h3 className="font-semibold">Regole di gioco</h3>
					<label className="flex items-center justify-between gap-2">
						Solitario: carte da girare dal mazzo
						<select
							value={settings.klondikeDraw}
							onChange={(e) =>
								onChange({
									...settings,
									klondikeDraw: e.target.value === "3" ? 3 : 1,
								})
							}
							className="rounded bg-slate-800 px-2 py-1"
						>
							<option value="1">1 carta</option>
							<option value="3">3 carte</option>
						</select>
					</label>
					<label className="flex items-center justify-between gap-2">
						Scopa: punti per vincere
						<select
							value={settings.scopaTarget}
							onChange={(e) => {
								const value = Number(e.target.value);
								onChange({
									...settings,
									scopaTarget: value === 16 ? 16 : value === 21 ? 21 : 11,
								});
							}}
							className="rounded bg-slate-800 px-2 py-1"
						>
							<option value="11">11 punti</option>
							<option value="16">16 punti</option>
							<option value="21">21 punti</option>
						</select>
					</label>
				</section>

				<section className="flex flex-col gap-2">
					<h3 className="font-semibold">Difficoltà</h3>
					{GAME_IDS.filter((id) => !SOLO_GAMES.includes(id)).map((id) => (
						<label key={id} className="flex items-center justify-between gap-2">
							{RULES[id].title}
							<select
								value={settings.difficulty[id]}
								onChange={(e) =>
									onChange({
										...settings,
										difficulty: {
											...settings.difficulty,
											[id]:
												DIFFICULTIES.find((d) => d === e.target.value) ??
												"medio",
										},
									})
								}
								className="rounded bg-slate-800 px-2 py-1 capitalize"
							>
								{DIFFICULTIES.map((d) => (
									<option key={d} value={d}>
										{d}
									</option>
								))}
							</select>
						</label>
					))}
				</section>

				<section className="flex flex-col gap-2">
					<h3 className="font-semibold">Regole</h3>
					<div className="flex flex-wrap gap-1">
						{GAME_IDS.map((id) => (
							<button
								key={id}
								type="button"
								onClick={() => setTab(id)}
								className={`rounded px-3 py-1 text-sm ${tab === id ? "bg-amber-500 text-slate-900" : "bg-slate-700"}`}
							>
								{RULES[id].title}
							</button>
						))}
					</div>
					<ul className="list-disc space-y-1 pl-5 text-emerald-50">
						{RULES[tab].rules.map((rule) => (
							<li key={rule}>{rule}</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
}
