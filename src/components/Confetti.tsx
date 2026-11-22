import { useMemo } from "react";

const COLORS = [
	"#facc15",
	"#ef4444",
	"#22c55e",
	"#3b82f6",
	"#a855f7",
	"#f97316",
];
const PIECES = 60;

/** Coriandoli in caduta, solo CSS */
export function Confetti() {
	const pieces = useMemo(
		() =>
			Array.from({ length: PIECES }, (_, i) => ({
				id: i,
				left: Math.random() * 100,
				delay: Math.random() * 0.6,
				duration: 1.2 + Math.random() * 0.8,
				color: COLORS[i % COLORS.length],
				rotate: Math.random() * 360,
			})),
		[],
	);

	return (
		<div className="absolute inset-0 overflow-hidden">
			{pieces.map((p) => (
				<span
					key={p.id}
					className="absolute -top-4 h-3 w-2 animate-confetti rounded-sm"
					style={{
						left: `${p.left}%`,
						backgroundColor: p.color,
						animationDelay: `${p.delay}s`,
						animationDuration: `${p.duration}s`,
						rotate: `${p.rotate}deg`,
					}}
				/>
			))}
		</div>
	);
}
