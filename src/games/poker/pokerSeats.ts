/** Indice del prossimo giocatore (in senso orario) che soddisfa la condizione */
export function nextIndex<T>(
	players: T[],
	from: number,
	ok: (p: T) => boolean,
): number {
	for (let step = 1; step <= players.length; step++) {
		const i = (from + step) % players.length;
		if (ok(players[i])) return i;
	}
	return from;
}

/** Posti di small e big blind: testa a testa il mazziere mette lo small blind */
export function blindSeats<T extends { out: boolean }>(
	players: T[],
	dealer: number,
): { smallBlind: number; bigBlind: number } {
	const alive = (p: T) => !p.out;
	const headsUp = players.filter(alive).length === 2;
	const smallBlind = headsUp ? dealer : nextIndex(players, dealer, alive);
	return { smallBlind, bigBlind: nextIndex(players, smallBlind, alive) };
}
