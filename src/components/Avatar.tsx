import { motion } from "framer-motion";
import type { Mood } from "../core/gameEvents";

const SKINS = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac"];
const HAIRS = ["#2c1b10", "#6b3e1e", "#d4a017", "#111827", "#9ca3af"];

const MOUTHS: Record<Mood, string> = {
	neutral: "M38 70 Q50 73 62 70",
	thinking: "M40 71 Q46 69 52 71 T62 70",
	happy: "M34 66 Q50 84 66 66",
	sad: "M36 76 Q50 64 64 76",
};

/** Dove guardano le pupille: in basso verso le carte, a destra e sinistra quando pensa */
const LOOK: Record<Mood, { x: number[]; y: number }> = {
	neutral: { x: [0], y: 3 },
	thinking: { x: [-3, 3, -3], y: 4 },
	happy: { x: [0], y: 0 },
	sad: { x: [0], y: 5 },
};

interface AvatarProps {
	name: string;
	mood: Mood;
	seed: number;
}

/** Volto SVG di un avversario CPU */
export function Avatar({ name, mood, seed }: AvatarProps) {
	const skin = SKINS[seed % SKINS.length];
	const hair = HAIRS[(seed * 3) % HAIRS.length];
	const look = LOOK[mood];

	return (
		<motion.svg
			viewBox="0 0 100 100"
			className="h-16 w-16 drop-shadow-lg"
			role="img"
			aria-label={`${name}: ${mood}`}
			animate={
				mood === "happy"
					? { y: [0, -6, 0] }
					: mood === "sad"
						? { rotate: [0, -6, 6, 0] }
						: { y: 0, rotate: 0 }
			}
			transition={{ duration: 0.6, repeat: mood === "happy" ? 2 : 0 }}
		>
			<title>{name}</title>
			<circle cx="50" cy="52" r="38" fill={skin} stroke="#00000033" />
			<path
				d="M14 46 Q16 10 50 12 Q84 10 86 46 Q70 26 50 30 Q30 26 14 46"
				fill={hair}
			/>
			{[36, 64].map((cx) => (
				<g key={cx}>
					<ellipse cx={cx} cy="50" rx="7" ry="6" fill="white" />
					<motion.circle
						cy="50"
						r="3.2"
						fill="#1f2937"
						initial={{ cx }}
						animate={{ cx: look.x.map((dx) => cx + dx), cy: 50 + look.y * 0.6 }}
						transition={{
							duration: 1.6,
							repeat: mood === "thinking" ? Number.POSITIVE_INFINITY : 0,
						}}
					/>
					{/* Palpebra che sbatte */}
					<rect
						x={cx - 8}
						y="43"
						width="16"
						height="14"
						fill={skin}
						className="origin-top animate-blink"
						style={{ transformBox: "fill-box" }}
					/>
				</g>
			))}
			{mood === "sad" && (
				<path d="M28 40 L42 44 M72 40 L58 44" stroke={hair} strokeWidth="3" />
			)}
			<motion.path
				d={MOUTHS[mood]}
				animate={{ d: MOUTHS[mood] }}
				stroke="#7f1d1d"
				strokeWidth="3"
				fill="none"
				strokeLinecap="round"
			/>
		</motion.svg>
	);
}
