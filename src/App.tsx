import { LayoutGroup } from "framer-motion";
import { useState } from "react";
import {
	type GameId,
	loadSettings,
	playerNames,
	type Settings,
	saveSettings,
} from "./core/settings";
import { Briscola } from "./games/briscola/Briscola";
import { Poker } from "./games/poker/Poker";
import { Scala40 } from "./games/scala40/Scala40";
import { Scopa } from "./games/scopa/Scopa";
import { SetteEMezzo } from "./games/setteEMezzo/SetteEMezzo";
import { FreeCell } from "./games/solitaire/FreeCell";
import { Klondike } from "./games/solitaire/Klondike";
import { Tombola } from "./games/tombola/Tombola";
import { MAX_CPU, MainMenu } from "./menu/MainMenu";

interface Session {
	game: GameId;
	resume: boolean;
}

export default function App() {
	const [settings, setSettings] = useState<Settings>(loadSettings);
	const [session, setSession] = useState<Session | null>(null);

	const updateSettings = (next: Settings) => {
		setSettings(next);
		saveSettings(next);
	};

	if (!session)
		return (
			<MainMenu
				settings={settings}
				onSettings={updateSettings}
				onPlay={(game, resume) => setSession({ game, resume })}
			/>
		);

	const { game, resume } = session;
	const props = {
		names: playerNames(settings, Math.min(settings.cpuCount, MAX_CPU[game])),
		difficulty: settings.difficulty[game],
		resume,
		onExit: () => setSession(null),
	};

	return (
		<LayoutGroup>
			{game === "setteEMezzo" && <SetteEMezzo {...props} />}
			{game === "briscola" && <Briscola {...props} />}
			{game === "scala40" && <Scala40 {...props} />}
			{game === "tombola" && <Tombola {...props} />}
			{game === "poker" && <Poker {...props} />}
			{game === "scopa" && <Scopa {...props} target={settings.scopaTarget} />}
			{game === "solitario" && (
				<Klondike
					drawCount={settings.klondikeDraw}
					resume={resume}
					onExit={props.onExit}
				/>
			)}
			{game === "freecell" && (
				<FreeCell resume={resume} onExit={props.onExit} />
			)}
		</LayoutGroup>
	);
}
