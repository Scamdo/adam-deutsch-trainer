import type { Question } from '../../types'
import { NATURE_SITES } from '../natur'
import { LAND_NAMES } from '../unesco'
import { mkFactory, SRC } from './helpers'

const n = mkFactory({ category: 'natur', source: SRC.natur, idPrefix: 'nd', stage: ['wojewodzki'] })
const h = mkFactory({ category: 'hoeren', source: SRC.hoeren, idPrefix: 'hv', stage: ['wojewodzki'] })

const LANDS = Object.keys(LAND_NAMES)
const rot = <T,>(a: T[], k: number) => a.map((_, i) => a[(i + k) % a.length])

const natureLand: Question[] = NATURE_SITES.map((s, i) => {
  const wrong = rot(LANDS.filter((l) => !s.lands.includes(l)), i * 3).slice(0, 3).map((l) => LAND_NAMES[l])
  return n.mc(`land-${s.id}`, 'naturdenkmale', 2, `In welchem Bundesland befindet sich „${s.name}“?`,
    [s.lands.map((l) => LAND_NAMES[l]).join(' / '), ...wrong], 0, s.deutsch, { tags: ['nd-land'] })
})

const natureRecognize: Question[] = NATURE_SITES.map((s, i) => {
  const others = rot(NATURE_SITES.filter((o) => o.id !== s.id), i * 2).slice(0, 3)
  return n.mc(`rec-${s.id}`, 'naturdenkmale', 2, `Welches Naturwunder ist gemeint? Stichworte: ${s.keywords.join(' · ')}`,
    [s.name, ...others.map((o) => o.name)], 0, s.deutsch, { prompt: 'Rozpoznaj obiekt.', tags: ['nd-recognize'] })
})

const natureHand: Question[] = [
  n.mc('b1', 'naturdenkmale', 2, 'Wer prägte den Begriff „Naturdenkmal“?', ['Alexander von Humboldt', 'Johann Wolfgang von Goethe', 'Caspar David Friedrich', 'Charles Darwin'], 0,
    'Alexander von Humboldt („monumens de la nature”); spopularyzował Hugo Conwentz.', { tags: ['nd-basics'] }),
  n.mc('b2', 'naturdenkmale', 2, 'Welcher Nationalpark war der erste in Deutschland (1970)?', ['Bayerischer Wald', 'Harz', 'Jasmund', 'Berchtesgaden'], 0,
    'Bayerischer Wald - 1970.', { tags: ['nd-basics'] }),
  n.mc('b3', 'naturdenkmale', 2, 'Wie viele Nationalparks gibt es in Deutschland?', ['16', '9', '26', '5'], 0,
    '16 parków narodowych.', { tags: ['nd-basics'] }),
  n.mc('b4', 'naturdenkmale', 3, 'Welcher Nationalpark ist der einzige in den deutschen Alpen?', ['Berchtesgaden', 'Bayerischer Wald', 'Schwarzwald', 'Sächsische Schweiz'], 0,
    'Berchtesgaden (1978).', { tags: ['nd-basics'] }),
  n.mc('b5', 'naturdenkmale', 3, 'In welchem Gesetz ist das Naturdenkmal heute geregelt?', ['im Bundesnaturschutzgesetz', 'im Grundgesetz', 'im Denkmalschutzgesetz', 'im Waldgesetz'], 0,
    '§ 28 Bundesnaturschutzgesetz (BNatSchG).', { tags: ['nd-basics'] }),
  n.input('b6', 'naturdenkmale', 3, 'Wie heißt der höchste Berg im Harz?', ['Brocken', 'der Brocken'],
    'Brocken, 1141 m.', { prompt: 'Odpowiedz po niemiecku.', tags: ['nd-facts'] }),
  n.mc('b7', 'naturdenkmale', 3, 'Wie nennt man Pflanzen und Tiere zusammen?', ['Flora und Fauna', 'Wald und Wiese', 'Natur und Umwelt', 'Klima und Wetter'], 0,
    'Flora (rośliny) i fauna (zwierzęta) - słownictwo z programu: „rośliny i zwierzęta”.', { tags: ['nd-wortschatz'] }),
  n.match('b8', 'naturdenkmale', 3, [
    ['die Schlucht / Klamm', 'wąwóz'],
    ['der Gipfel', 'szczyt'],
    ['die Quelle', 'źródło'],
    ['das Ufer', 'brzeg'],
    ['die Himmelsrichtung', 'strona świata'],
  ], 'Słownictwo: przyroda i krajobraz (program etapu wojewódzkiego).', { prompt: 'Dopasuj znaczenia.', extra: ['jaskinia', 'dolina'], tags: ['nd-wortschatz'] }),
]

// ===== Hörverstehen (syntezator mowy) =====
const hoeren: Question[] = [
  h.reading('a1', 'hoeren-alltag', 2, 'Durchsage am Bahnhof',
    'Achtung am Gleis sieben. Der ICE 578 nach Hamburg-Altona, planmäßige Abfahrt 14 Uhr 32, hat heute circa zwanzig Minuten Verspätung. Grund dafür ist eine Signalstörung. Reisende nach Hannover nutzen bitte den Regionalexpress um 14 Uhr 40 von Gleis drei. Wir bitten um Entschuldigung.',
    [
      { q: 'Wie viel Verspätung hat der ICE?', options: ['etwa 10 Minuten', 'etwa 20 Minuten', 'etwa 32 Minuten', 'etwa 40 Minuten'], answer: 1 },
      { q: 'Warum hat der Zug Verspätung?', options: ['wegen des Wetters', 'wegen einer Signalstörung', 'wegen eines Unfalls', 'wegen Bauarbeiten'], answer: 1 },
      { q: 'Von welchem Gleis fährt der Regionalexpress nach Hannover?', options: ['Gleis 3', 'Gleis 7', 'Gleis 14', 'Gleis 40'], answer: 0 },
    ], 'Zapisuj liczby podczas słuchania - to typowe pułapki (7 / 3 / 14:32 / 14:40).',
    { prompt: 'Posłuchaj nagrania (możesz dwa razy) i odpowiedz na pytania.', tags: ['audio'] }),
  h.reading('a2', 'hoeren-alltag', 3, 'Interview: Leben am Wattenmeer',
    'Frau Petersen, Sie arbeiten seit fünfzehn Jahren als Wattführerin in Cuxhaven. Was gefällt Ihnen an Ihrem Beruf? — Jeder Tag ist anders. Das Meer bestimmt meinen Terminkalender, denn wir können nur bei Ebbe hinaus. Am liebsten führe ich Schulklassen, weil Kinder so neugierig sind. — Ist Wattwandern gefährlich? — Ohne Führer schon. Viele Touristen unterschätzen, wie schnell das Wasser zurückkommt. Deshalb sollte man niemals allein gehen und immer auf die Uhrzeit achten. — Was sieht man bei so einer Wanderung? — Wattwürmer, Krebse, Muscheln und mit etwas Glück auch Seehunde auf einer Sandbank.',
    [
      { q: 'Wie lange arbeitet Frau Petersen schon als Wattführerin?', options: ['5 Jahre', '15 Jahre', '50 Jahre', 'seit einem Jahr'], answer: 1 },
      { q: 'Wen führt sie am liebsten?', options: ['Touristen aus dem Ausland', 'Schulklassen', 'Senioren', 'Fotografen'], answer: 1 },
      { q: 'Was unterschätzen viele Touristen?', options: ['die Kälte', 'die Entfernung', 'wie schnell das Wasser zurückkommt', 'die Preise'], answer: 2 },
      { q: 'Welche Tiere sieht man nur mit Glück?', options: ['Wattwürmer', 'Krebse', 'Muscheln', 'Seehunde'], answer: 3 },
    ], 'Słowo-klucz „mit etwas Glück” odnosi się tylko do fok.',
    { prompt: 'Posłuchaj nagrania (możesz dwa razy) i odpowiedz na pytania.', tags: ['audio'] }),
  h.reading('a3', 'hoeren-alltag', 3, 'Radiobeitrag: Nationalpark Sächsische Schweiz',
    'Der Nationalpark Sächsische Schweiz wurde 1990 gegründet und liegt südöstlich von Dresden an der Grenze zu Tschechien. Das Wahrzeichen der Region ist die Bastei, eine Felsformation, die etwa 194 Meter über der Elbe liegt. Jedes Jahr besuchen Hunderttausende Menschen die Basteibrücke. Kletterer lieben die Sandsteinfelsen, allerdings gelten hier strenge Regeln: Magnesia, also Kletterpulver, ist verboten, und in den Kernzonen darf man die Wege nicht verlassen. Im Sommer 2022 zerstörte ein großer Waldbrand Teile des Nationalparks.',
    [
      { q: 'Wann wurde der Nationalpark gegründet?', options: ['1970', '1978', '1990', '2022'], answer: 2 },
      { q: 'An welches Land grenzt der Nationalpark?', options: ['Polen', 'Tschechien', 'Österreich', 'die Schweiz'], answer: 1 },
      { q: 'Was ist für Kletterer verboten?', options: ['Klettern ohne Seil', 'Magnesia', 'Klettern am Wochenende', 'Klettern in Gruppen'], answer: 1 },
      { q: 'Was passierte im Sommer 2022?', options: ['Eine neue Brücke wurde gebaut.', 'Es gab einen großen Waldbrand.', 'Der Park wurde vergrößert.', 'Die Bastei wurde geschlossen.'], answer: 1 },
    ], 'Nazwa „Sächsische Schweiz” to pułapka - park graniczy z Czechami, nie ze Szwajcarią.',
    { prompt: 'Posłuchaj nagrania (możesz dwa razy) i odpowiedz na pytania.', tags: ['audio', 'natur'] }),
]

export const NATUR_QUESTIONS: Question[] = [...natureHand, ...natureLand, ...natureRecognize]
export const HOEREN_QUESTIONS: Question[] = hoeren
