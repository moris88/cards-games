import { AnimatePresence, motion } from "framer-motion";
import { smorfia } from "./smorfia";

interface DrawnBallProps {
	number: number | undefined;
	paused: boolean;
}

/** Panariello che si agita e numero estratto con il significato della smorfia */
export function DrawnBall({ number, paused }: DrawnBallProps) {
	const entry = number ? smorfia(number) : null;

	return (
		<div className="flex items-center gap-4">
			<motion.div
				className="text-4xl sm:text-6xl"
				animate={paused ? { rotate: 0 } : { rotate: [0, -12, 12, -8, 8, 0] }}
				transition={{
					duration: 0.8,
					repeat: paused ? 0 : Number.POSITIVE_INFINITY,
					repeatDelay: 2.4,
				}}
				aria-hidden="true"
			>
				🧺
			</motion.div>
			<div className="relative h-28 w-56 sm:h-36 sm:w-64">
				<AnimatePresence mode="popLayout">
					{number && entry && (
						<motion.div
							key={number}
							initial={{ x: -120, y: 30, scale: 0.2, rotate: -360, opacity: 0 }}
							animate={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
							exit={{ x: 140, scale: 0.4, opacity: 0 }}
							transition={{ type: "spring", stiffness: 140, damping: 14 }}
							className="absolute inset-0 flex items-center gap-3"
						>
							<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-red-900 bg-[radial-gradient(circle_at_30%_30%,#fff,#fde68a)] text-2xl sm:h-24 sm:w-24 sm:text-4xl font-black text-red-900 shadow-xl">
								{number}
							</div>
							<div>
								<div className="text-4xl">{entry.emoji}</div>
								<div className="font-bold">{entry.italiano}</div>
								<div className="text-sm italic text-emerald-100">
									{entry.napoletano}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
