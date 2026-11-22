import { MAX_OPPONENTS, type Settings } from "../core/settings";

interface PlayersSettingsProps {
	settings: Settings;
	onChange: (settings: Settings) => void;
}

const INPUT = "w-40 rounded bg-slate-800 px-2 py-1";

/** Nome del giocatore, numero di avversari e loro nomi */
export function PlayersSettings({ settings, onChange }: PlayersSettingsProps) {
	const setCpuName = (index: number, name: string) =>
		onChange({
			...settings,
			cpuNames: settings.cpuNames.map((n, i) => (i === index ? name : n)),
		});

	return (
		<section className="flex flex-col gap-2">
			<h3 className="font-semibold">Giocatori</h3>
			<label className="flex items-center justify-between gap-2">
				Il tuo nome
				<input
					className={INPUT}
					maxLength={16}
					value={settings.playerName}
					onChange={(e) =>
						onChange({ ...settings, playerName: e.target.value })
					}
				/>
			</label>
			<label className="flex items-center justify-between gap-2">
				Numero di avversari CPU
				<select
					value={settings.cpuCount}
					onChange={(e) =>
						onChange({ ...settings, cpuCount: Number(e.target.value) })
					}
					className="rounded bg-slate-800 px-2 py-1"
				>
					{Array.from({ length: MAX_OPPONENTS }, (_, i) => i + 1).map((n) => (
						<option key={n} value={n}>
							{n}
						</option>
					))}
				</select>
			</label>
			<p className="text-xs text-emerald-200">
				Briscola si gioca sempre 1 contro 1; Sette e mezzo e Scala 40 al massimo
				con 3 avversari.
			</p>
			{settings.cpuNames.slice(0, settings.cpuCount).map((name, i) => (
				<label
					// biome-ignore lint/suspicious/noArrayIndexKey: posizione fissa dell'avversario
					key={i}
					className="flex items-center justify-between gap-2"
				>
					Avversario {i + 1}
					<input
						className={INPUT}
						maxLength={16}
						value={name}
						onChange={(e) => setCpuName(i, e.target.value)}
					/>
				</label>
			))}
		</section>
	);
}
