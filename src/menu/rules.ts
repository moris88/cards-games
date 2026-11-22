import type { GameId } from "../core/settings";

export interface GameRules {
	title: string;
	rules: string[];
}

export const RULES: Record<GameId, GameRules> = {
	setteEMezzo: {
		title: "Sette e mezzo",
		rules: [
			"Si gioca con 40 carte napoletane. Le carte da 1 a 7 valgono il loro numero, le figure (Fante, Cavallo, Re) valgono ½.",
			"Il Re di denari è la matta: assume il valore più conveniente tra ½ e 7.",
			"Prima di ricevere la carta ogni giocatore punta le sue fiches. Il mazziere gioca contro tutti.",
			"La prima carta è coperta. Si chiede carta per avvicinarsi a 7½ senza superarlo: chi supera sballa e perde la puntata.",
			"Alla fine il mazziere gioca la sua mano. A parità di punti vince il mazziere.",
			"Sette e mezzo reale (matta + 7 con due sole carte) paga il doppio e fa diventare mazziere.",
			"Chi resta senza fiches è eliminato.",
		],
	},
	briscola: {
		title: "Briscola",
		rules: [
			"Si gioca in due con 40 carte napoletane. Si danno 3 carte a testa e se ne gira una: il suo seme è la briscola.",
			"Ordine di presa: Asso, Tre, Re, Cavallo, Fante, 7, 6, 5, 4, 2.",
			"Punti: Asso 11, Tre 10, Re 4, Cavallo 3, Fante 2, le altre 0. In totale 120 punti.",
			"Non c'è obbligo di rispondere al seme. Prende la carta più alta del seme di uscita, a meno che non venga giocata una briscola.",
			"Dopo ogni presa si pesca: prima chi ha preso, che poi gioca per primo.",
			"Vince chi fa più di 60 punti; 60 a 60 è pareggio.",
		],
	},
	scala40: {
		title: "Scala 40",
		rules: [
			"Si gioca con due mazzi da 52 carte più 4 jolly. Si danno 13 carte a testa.",
			"A ogni turno si pesca (dal mazzo, oppure dagli scarti se si è già aperto), si calano o attaccano carte e si scarta una carta.",
			"Combinazioni: tris o poker (stesso valore, semi diversi) e scale (almeno 3 carte consecutive dello stesso seme). Al massimo un jolly per combinazione.",
			"La prima calata (apertura) deve valere almeno 40 punti. Figure 10, Asso 1 o 11, jolly come la carta che sostituisce.",
			"Si chiude restando senza carte dopo l'ultimo scarto. Gli altri contano le carte in mano (jolly 25, Asso 11, figure 10); chi non ha aperto prende 100.",
			"A 101 punti si è eliminati: vince l'ultimo che resta.",
		],
	},
	tombola: {
		title: "Tombola",
		rules: [
			"Ogni cartella ha 15 numeri su 3 righe da 5. Ogni giocatore può avere da 1 a 6 cartelle; ogni cartella costa 2 fiches, che vanno nel piatto.",
			"Il tabellone estrae i numeri da 1 a 90, ognuno con il significato della smorfia napoletana.",
			"Segna tu i numeri usciti cliccandoli sulle tue cartelle.",
			"Premi: ambo (2 numeri sulla stessa riga), terno (3), quaterna (4), cinquina (5) e tombola (tutta la cartella).",
			"Le vincite vanno chiamate a mano con i bottoni: vince chi chiama per primo. Una chiamata sbagliata costa 2 fiches.",
			"Ripartizione del piatto: ambo 10%, terno 15%, quaterna 20%, cinquina 25%, tombola 30%.",
		],
	},
	poker: {
		title: "Poker Texas Hold'em",
		rules: [
			"No-Limit Texas Hold'em con mazzo da 52 carte. Ogni giocatore riceve 2 carte coperte; sul tavolo escono 5 carte comuni.",
			"Small blind (5) e big blind (10) sono puntate obbligatorie a sinistra del mazziere.",
			"Giri di puntata: preflop, flop (3 carte), turn (1 carta), river (1 carta). Si può passare (fold), bussare (check), vedere (call), puntare o rilanciare (bet/raise) e andare all-in.",
			"Il rilancio minimo è pari all'ultima puntata o all'ultimo rilancio. Chi va all-in partecipa solo al piatto che ha coperto (side pot).",
			"Allo showdown vince la miglior combinazione di 5 carte tra le 7 disponibili.",
			"Punteggi dal più alto: scala reale, scala colore, poker, full, colore, scala, tris, doppia coppia, coppia, carta alta.",
			"Chi resta senza fiches è eliminato; vince chi rimane da solo al tavolo.",
		],
	},
	scopa: {
		title: "Scopa",
		rules: [
			"Si gioca con 40 carte napoletane: 1 contro 1, in tre, oppure 2 contro 2 a coppie (con 3 avversari il compagno è quello di fronte).",
			"Si danno 3 carte a testa e 4 scoperte in tavola (se ci sono 3 o più Re si rimescola). Finite le carte in mano se ne danno altre 3.",
			"Valori di presa: dall'Asso (1) al 7, Fante 8, Cavallo 9, Re 10.",
			"Si prende una carta dello stesso valore o più carte la cui somma è uguale. Se c'è una carta uguale bisogna prendere quella.",
			"Se non si può prendere, la carta resta in tavola. Chi svuota la tavola fa scopa (1 punto), tranne con l'ultima carta della smazzata.",
			"A fine smazzata le carte rimaste vanno a chi ha preso per ultimo.",
			"Punti: carte (più di 20), denari (più di 5), settebello, primiera e uno per ogni scopa. A parità il punto non si assegna.",
			"Primiera: la migliore carta per seme, con 7 = 21, 6 = 18, Asso = 16, 5 = 15, 4 = 14, 3 = 13, 2 = 12, figure = 10.",
			"Vince chi arriva per primo a 11, 16 o 21 punti (si sceglie nelle opzioni); a pari merito si gioca un'altra smazzata.",
		],
	},
	solitario: {
		title: "Solitario",
		rules: [
			"Klondike con mazzo da 52 carte. Sette colonne: la prima ha 1 carta, l'ultima 7; solo l'ultima carta di ogni colonna è scoperta.",
			"Scopo: portare tutte le carte nelle quattro fondazioni, per seme, dall'Asso al Re.",
			"Nelle colonne si mettono le carte in ordine decrescente a colori alterni (rosso su nero). Una colonna vuota accetta solo un Re.",
			"Si possono spostare intere sequenze già ordinate. Spostando una carta, quella coperta sotto si scopre.",
			"Dal mazzo si girano 1 o 3 carte (si sceglie nelle opzioni); finito il mazzo, il pozzo si rigira.",
			"Punteggio: +5 dal pozzo a una colonna, +10 in fondazione, +5 per ogni carta scoperta, -15 togliendo dalla fondazione, -100 (gira 1) o -20 (gira 3) rigirando il mazzo.",
			"Trascina le carte; doppio clic per mandarle in fondazione. Quando tutte le carte sono scoperte compare il tasto Completa.",
		],
	},
	freecell: {
		title: "FreeCell",
		rules: [
			"Tutte le 52 carte sono distribuite scoperte in otto colonne.",
			"Ci sono quattro celle libere, ognuna può contenere una carta, e quattro fondazioni da riempire per seme dall'Asso al Re.",
			"Nelle colonne si mettono le carte in ordine decrescente a colori alterni. Una colonna vuota accetta qualsiasi carta.",
			"Si sposta una carta alla volta; le sequenze si spostano insieme se ci sono abbastanza celle e colonne libere: (celle libere + 1) × 2^(colonne vuote).",
			"Ogni partita ha un numero da 1 a 1.000.000: lo stesso numero dà sempre la stessa distribuzione.",
			"Doppio clic: la carta va in fondazione, altrimenti in una cella libera.",
		],
	},
};
