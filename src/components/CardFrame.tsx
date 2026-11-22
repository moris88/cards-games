export type DeckType = "napoletane" | "francesi";

/** Proporzioni reali delle immagini: napoletane ~0.6, francesi 2:3 */
const SIZES: Record<DeckType, { normal: string; small: string }> = {
	napoletane: { normal: "w-20 h-[8.25rem]", small: "w-12 h-20" },
	francesi: { normal: "w-20 h-30", small: "w-12 h-[4.5rem]" },
};

interface CardFrameProps {
	deck: DeckType;
	src?: string;
	alt?: string;
	faceDown?: boolean;
	selected?: boolean;
	small?: boolean;
	onClick?: () => void;
}

/** Carta da gioco con immagine fronte/retro */
export function CardFrame({
	deck,
	src,
	alt,
	faceDown,
	selected,
	small,
	onClick,
}: CardFrameProps) {
	const size = SIZES[deck][small ? "small" : "normal"];
	const state = selected ? "-translate-y-4 ring-4 ring-yellow-400" : "";
	const interactive = onClick ? "cursor-pointer hover:-translate-y-2" : "";
	const image =
		faceDown || !src
			? `/cards/${deck}/retro.${deck === "napoletane" ? "jpg" : "svg"}`
			: src;

	return (
		<button
			type="button"
			title={faceDown ? "Carta coperta" : alt}
			disabled={!onClick}
			onClick={onClick}
			className={`${size} ${state} ${interactive} relative shrink-0 animate-deal overflow-hidden rounded-md bg-white shadow-md shadow-black/40 transition-transform duration-200 select-none disabled:cursor-default`}
		>
			<img
				src={image}
				alt={faceDown ? "Carta coperta" : alt}
				draggable={false}
				className="h-full w-full object-fill"
			/>
		</button>
	);
}
