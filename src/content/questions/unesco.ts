import type { Question } from '../../types'
import { LAND_NAMES, UNESCO_SITES, type UnescoSite } from '../unesco'
import { mkFactory, SRC } from './helpers'

const q = mkFactory({ category: 'unesco', source: SRC.unesco, idPrefix: 'un', stage: ['rejonowy'] })

/** Deterministyczny pseudolosowy wybór (stabilne ID i opcje między uruchomieniami) */
function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}
function pick<T>(arr: T[], n: number, seed: string): T[] {
  const r = seeded(seed)
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

const landName = (s: UnescoSite) => s.lands.map((l) => LAND_NAMES[l]).join(' / ')
const shortName = (s: UnescoSite) => s.name.replace(/ \(.+\)$/, '')
const ALL_LANDS = Object.keys(LAND_NAMES)
const core = UNESCO_SITES.filter((s) => s.core)

// ---- 1) Obiekt → Bundesland ----
const siteToLand: Question[] = UNESCO_SITES.map((s) => {
  const wrong = pick(ALL_LANDS.filter((l) => !s.lands.includes(l)), 3, 'land-' + s.id).map((l) => LAND_NAMES[l])
  return q.mc(`s2l-${s.id}`, 'unesco-objekte', s.core ? 2 : 3, `In welchem Bundesland liegt die Welterbestätte „${shortName(s)}“?`,
    [landName(s), ...wrong], 0,
    `${shortName(s)} (${s.place}) → **${landName(s)}**. Wpis na listę: ${s.year}.`,
    { tags: ['site-land', s.core ? 'core' : 'extra'], media: { kind: 'site', siteId: s.id } } )
})

// ---- 2) Bundesland → obiekt (tylko core) ----
const landToSite: Question[] = core.map((s) => {
  const others = pick(UNESCO_SITES.filter((o) => !o.lands.some((l) => s.lands.includes(l))), 3, 'l2s-' + s.id)
  const land = LAND_NAMES[s.lands[0]]
  return q.mc(`l2s-${s.id}`, 'unesco-objekte', 2, `Welche dieser Welterbestätten liegt in ${land}?`,
    [shortName(s), ...others.map(shortName)], 0,
    `W kraju ${land} leży m.in.: **${shortName(s)}** (${s.place}). Pozostałe: ${others.map((o) => `${shortName(o)} - ${landName(o)}`).join('; ')}.`,
    { tags: ['land-site', 'core'] })
})

// ---- 3) Rok wpisu (core) ----
const years: Question[] = core.map((s) => {
  const r = seeded('y-' + s.id)
  const offs = new Set<number>()
  while (offs.size < 3) {
    const o = Math.round((r() - 0.5) * 24)
    if (o !== 0 && s.year + o <= 2025 && s.year + o >= 1972) offs.add(o)
  }
  return q.mc(`year-${s.id}`, 'unesco-objekte', 3, `Seit wann gehört „${shortName(s)}“ zum UNESCO-Welterbe?`,
    [String(s.year), ...[...offs].map((o) => String(s.year + o))], 0,
    `${shortName(s)}: wpis w **${s.year}**${s.extended ? ` (rozszerzenie: ${s.extended})` : ''}.`,
    { tags: ['site-year', 'core'] })
})

// ---- 4) Rozpoznaj obiekt po opisie (core) ----
const recognize: Question[] = core.map((s) => {
  const others = pick(core.filter((o) => o.id !== s.id), 3, 'rec-' + s.id)
  return q.mc(`rec-${s.id}`, 'unesco-objekte', 2, `Welche Welterbestätte ist gemeint? Stichworte: ${s.keywords.join(' · ')}`,
    [shortName(s), ...others.map(shortName)], 0,
    `${s.deutsch}`, { prompt: 'Rozpoznaj obiekt.', tags: ['site-recognize', 'core'] })
})

// ---- 5) Otwarte: miasto (core, jednoznaczne) ----
const OPEN_CITY: Record<string, string[]> = {
  aachen: ['Aachen'], koeln: ['Köln'], speyer: ['Speyer'], wartburg: ['Eisenach'], luebeck: ['Lübeck'], regensburg: ['Regensburg'],
  zollverein: ['Essen'], voelklingen: ['Völklingen'], speicherstadt: ['Hamburg'], schwerin: ['Schwerin'], bamberg: ['Bamberg'],
  wuerzburg: ['Würzburg'], museumsinsel: ['Berlin'], trier: ['Trier'], bruehl: ['Brühl'], goslar: ['Goslar'], weissenhof: ['Stuttgart'],
}
const openCity: Question[] = core.filter((s) => OPEN_CITY[s.id]).map((s) =>
  q.input(`city-${s.id}`, 'unesco-objekte', 3, `In welcher Stadt befindet sich die Welterbestätte „${shortName(s)}“?`, OPEN_CITY[s.id],
    `${shortName(s)} → **${OPEN_CITY[s.id][0]}** (${landName(s)}).`,
    { prompt: 'Odpowiedz po niemiecku (pełna poprawność pisowni nazw własnych).', tags: ['site-city', 'core'] }),
)

// ---- 6) Pytania ręczne - głębsza wiedza ----
const handcrafted: Question[] = [
  q.mc('h1', 'unesco-grundlagen', 1, 'Welche Welterbestätte war 1978 die erste in Deutschland?', ['der Aachener Dom', 'der Kölner Dom', 'die Wartburg', 'Schloss Sanssouci'], 0,
    'Katedra w Akwizgranie - 1978.', { tags: ['basics'] }),
  q.mc('h2', 'unesco-grundlagen', 2, 'Welche deutsche Welterbestätte wurde zuletzt (2025) in die Liste aufgenommen?', ['die Schlösser König Ludwigs II.', 'Residenzensemble Schwerin', 'Herrnhut', 'die Speicherstadt'], 0,
    'Zamki Ludwika II - 2025. Schwerin i Herrnhut - 2024.', { tags: ['basics'] }),
  q.mc('h3', 'unesco-grundlagen', 2, 'Welche Stätte verlor 2009 den Welterbetitel wegen des Baus einer Brücke?', ['das Dresdner Elbtal', 'das Obere Mittelrheintal', 'die Altstadt von Regensburg', 'der Kölner Dom'], 0,
    'Dolina Łaby w Dreźnie - most Waldschlößchenbrücke.', { tags: ['basics', 'rote-liste'] }),
  q.mc('h4', 'unesco-grundlagen', 2, 'Wie viele Welterbestätten hat Deutschland (Stand 2025)?', ['55', '35', '16', '75'], 0,
    '55 obiektów (stan 2025, KMK / deutschland.de).', { tags: ['basics'] }),
  q.mc('h5', 'unesco-grundlagen', 3, 'Wo hat die UNESCO ihren Sitz?', ['in Paris', 'in Genf', 'in New York', 'in Brüssel'], 0,
    'Siedziba UNESCO - Paryż.', { tags: ['basics'] }),
  q.mc('h6', 'unesco-objekte', 2, 'Was bedeutet der Name „Sanssouci“?', ['ohne Sorge', 'schönes Haus', 'kleines Schloss', 'Sommerpalast'], 0,
    'Fr. sans souci = bez trosk.', { tags: ['sanssouci'] }),
  q.mc('h7', 'unesco-objekte', 2, 'Welcher König ließ Schloss Sanssouci bauen?', ['Friedrich der Große', 'Ludwig II.', 'Karl der Große', 'Wilhelm II.'], 0,
    'Fryderyk II Wielki, król Prus (1745-1747).', { tags: ['sanssouci'] }),
  q.mc('h8', 'unesco-objekte', 2, 'Wie heißt das berühmte römische Stadttor in Trier?', ['Porta Nigra', 'Brandenburger Tor', 'Holstentor', 'Porta Westfalica'], 0,
    'Porta Nigra = „Czarna Brama”.', { tags: ['trier'] }),
  q.mc('h9', 'unesco-objekte', 3, 'Wer schrieb das bekannte Gedicht über die Loreley?', ['Heinrich Heine', 'Johann Wolfgang von Goethe', 'Friedrich Schiller', 'die Brüder Grimm'], 0,
    'Heinrich Heine, „Die Lore-Ley” (1824).', { tags: ['mittelrhein'] }),
  q.mc('h10', 'unesco-objekte', 3, 'Woran erinnert die Form des Chilehauses in Hamburg?', ['an einen Schiffsbug', 'an einen Leuchtturm', 'an eine Welle', 'an einen Anker'], 0,
    'Chilehaus przypomina dziób statku.', { tags: ['speicherstadt'] }),
  q.mc('h11', 'unesco-objekte', 2, 'Was hat Martin Luther auf der Wartburg gemacht?', ['das Neue Testament übersetzt', 'die 95 Thesen veröffentlicht', 'geheiratet', 'eine Universität gegründet'], 0,
    'Wartburg 1521/22: tłumaczenie Nowego Testamentu. Tezy - Wittenberga 1517.', { tags: ['wartburg', 'luther'] }),
  q.mc('h12', 'unesco-objekte', 3, 'Welche Welterbestätte teilt sich Deutschland mit Polen?', ['den Muskauer Park', 'das Wattenmeer', 'die Montanregion Erzgebirge', 'den Donaulimes'], 0,
    'Park Mużakowski / Muskauer Park nad Nysą Łużycką.', { tags: ['polen', 'extra'] }),
  q.mc('h13', 'unesco-objekte', 3, 'Welcher Künstler malte das riesige Deckenfresko im Treppenhaus der Würzburger Residenz?', ['Giovanni Battista Tiepolo', 'Albrecht Dürer', 'Caspar David Friedrich', 'Lucas Cranach'], 0,
    'Giovanni Battista Tiepolo (1752-1753).', { tags: ['wuerzburg'] }),
  q.mc('h14', 'unesco-objekte', 2, 'Welches Schloss inspirierte Walt Disney zu seinem Dornröschenschloss?', ['Neuschwanstein', 'Linderhof', 'Sanssouci', 'Schwerin'], 0,
    'Neuschwanstein.', { tags: ['ludwig'] }),
  q.mc('h15', 'unesco-objekte', 3, 'Welches Schloss Ludwigs II. ist eine Nachahmung von Versailles?', ['Herrenchiemsee', 'Neuschwanstein', 'Linderhof', 'Hohenschwangau'], 0,
    'Herrenchiemsee (na wyspie Herreninsel w Chiemsee) - kopia Wersalu, Galeria Zwierciadlana.', { tags: ['ludwig'] }),
  q.mc('h16', 'unesco-objekte', 3, 'Welche dieser Stätten ist ein Weltnaturerbe?', ['das Wattenmeer', 'der Kölner Dom', 'die Zeche Zollverein', 'die Wartburg'], 0,
    'Dziedzictwo przyrodnicze w Niemczech: Morze Wattowe, lasy bukowe, kopalnia Messel.', { tags: ['natur'] }),
  q.mc('h17', 'unesco-objekte', 3, 'Welcher Rohstoff wurde in der Zeche Zollverein abgebaut?', ['Steinkohle', 'Silber', 'Salz', 'Eisenerz'], 0,
    'Węgiel kamienny (Steinkohle). Srebro - Rammelsberg, Rudawy.', { tags: ['zollverein'] }),
  q.mc('h18', 'unesco-objekte', 3, 'Wie lange wurde im Rammelsberg Erz abgebaut?', ['über 1000 Jahre', 'etwa 100 Jahre', 'etwa 300 Jahre', '50 Jahre'], 0,
    'Ponad 1000 lat, do 1988 r.', { tags: ['goslar'] }),
  q.mc('h19', 'unesco-objekte', 2, 'In welcher Stadt wurde die Bauhaus-Schule 1919 gegründet?', ['Weimar', 'Dessau', 'Berlin', 'Stuttgart'], 0,
    'Weimar 1919 → Dessau 1925 → Berlin 1932.', { tags: ['bauhaus'] }),
  q.mc('h20', 'unesco-objekte', 3, 'Was ist die „Steinerne Brücke“?', ['eine mittelalterliche Brücke in Regensburg', 'eine römische Brücke in Trier', 'eine Brücke über den Rhein in Köln', 'ein Teil der Berliner Mauer'], 0,
    'Most Kamienny w Ratyzbonie, XII w.', { tags: ['regensburg'] }),
  q.input('h21', 'unesco-objekte', 3, 'Wie heißt das Wahrzeichen von Lübeck, ein altes Stadttor?', ['Holstentor', 'das Holstentor'],
    'Holstentor.', { prompt: 'Odpowiedz po niemiecku.', tags: ['luebeck'] }),
  q.input('h22', 'unesco-objekte', 3, 'Wie heißt der Fluss, an dem der Kölner Dom steht?', ['Rhein', 'der Rhein'],
    'Ren.', { prompt: 'Odpowiedz po niemiecku.', tags: ['koeln'] }),
  q.input('h23', 'unesco-objekte', 3, 'Welcher König ließ Neuschwanstein bauen? (imię + numer, np. „Karl V.”)', ['Ludwig II.', 'Ludwig II', 'König Ludwig II.', 'Ludwig der Zweite'],
    'Ludwig II. von Bayern.', { prompt: 'Odpowiedz po niemiecku.', tags: ['ludwig'] }),
  q.match('h24', 'unesco-objekte', 3, [
    ['Porta Nigra', 'Trier'],
    ['Holstentor', 'Lübeck'],
    ['Chilehaus', 'Hamburg'],
    ['Steinerne Brücke', 'Regensburg'],
    ['Bamberger Reiter', 'Bamberg'],
  ], 'Symbole i miasta UNESCO.', { prompt: 'Dopasuj zabytek do miasta.', extra: ['Köln', 'Goslar'], tags: ['symbole'] }),
  q.match('h25', 'unesco-objekte', 3, [
    ['Karl der Große', 'Aachener Dom'],
    ['Friedrich der Große', 'Sanssouci'],
    ['Martin Luther', 'Wartburg'],
    ['Walter Gropius', 'Bauhaus'],
    ['Balthasar Neumann', 'Würzburger Residenz'],
  ], 'Postacie związane z obiektami UNESCO.', { prompt: 'Dopasuj osobę do obiektu.', extra: ['Neuschwanstein', 'Zeche Zollverein'], tags: ['personen'] }),
  q.order('h26', 'unesco-objekte', 3, ['Aachener Dom (1978)', 'Würzburger Residenz (1981)', 'Kölner Dom (1996)', 'Oberes Mittelrheintal (2002)', 'Schlösser Ludwigs II. (2025)'],
    'Chronologia wpisów na listę UNESCO.', { prompt: 'Ułóż obiekty w kolejności wpisu na listę UNESCO (od najwcześniejszego).', tags: ['timeline'] }),
  q.tf('h27', 'unesco-grundlagen', 2, 'Richtig oder falsch?', [
    { statement: 'Der Kölner Dom stand einige Jahre auf der Roten Liste des gefährdeten Welterbes.', answer: true },
    { statement: 'Das Wattenmeer ist ein Weltkulturerbe.', answer: false },
    { statement: 'Neuschwanstein wurde nie ganz fertig gebaut.', answer: true },
    { statement: 'Die Zeche Zollverein liegt in Bayern.', answer: false },
  ], 'Wattenmeer = dziedzictwo PRZYRODNICZE; Zollverein - Essen, NRW.', { tags: ['basics'] }),
]

// ---- Słownictwo UNESCO ----
const vocab: Question[] = [
  q.mc('v1', 'unesco-wortschatz', 1, 'Ein Gebäude oder Ort, das/der typisch für eine Stadt ist, nennt man ...', ['Wahrzeichen', 'Kennzeichen', 'Verkehrszeichen', 'Lesezeichen'], 0,
    'das Wahrzeichen = symbol miasta.', { tags: ['wortschatz-kultur'], stage: ['rejonowy', 'wojewodzki'] }),
  q.mc('v2', 'unesco-wortschatz', 2, 'Wie heißt ein Rundgang mit einem Guide durch ein Museum?', ['Führung', 'Leitung', 'Fahrt', 'Vorstellung'], 0,
    'die Führung = oprowadzanie.', { tags: ['wortschatz-reisen'], stage: ['rejonowy', 'wojewodzki'] }),
  q.mc('v3', 'unesco-wortschatz', 2, 'Ein Haus mit sichtbarem Holzgerüst nennt man ...', ['Fachwerkhaus', 'Hochhaus', 'Backsteinhaus', 'Gartenhaus'], 0,
    'das Fachwerkhaus - dom szachulcowy (Quedlinburg, Goslar).', { tags: ['wortschatz-kultur'], stage: ['rejonowy', 'wojewodzki'] }),
  q.mc('v4', 'unesco-wortschatz', 2, 'Welcher Baustil kam zuerst?', ['Romanik', 'Gotik', 'Barock', 'Jugendstil'], 0,
    'Romanizm (ok. 1000-1250) → gotyk → renesans → barok → rokoko → klasycyzm → historyzm → secesja.', { tags: ['baustile'], stage: ['rejonowy', 'wojewodzki'] }),
  q.match('v5', 'unesco-wortschatz', 2, [
    ['das Kloster', 'klasztor'],
    ['die Burg', 'zamek obronny'],
    ['die Zeche', 'kopalnia'],
    ['das Denkmal', 'zabytek, pomnik'],
    ['die Sehenswürdigkeit', 'atrakcja turystyczna'],
  ], 'Słownictwo tematyczne UNESCO.', { prompt: 'Dopasuj znaczenia.', extra: ['ratusz', 'most'], tags: ['wortschatz-kultur'], stage: ['rejonowy', 'wojewodzki'] }),
  q.input('v6', 'unesco-wortschatz', 3, 'Der Kölner Dom wurde 1996 in die Welterbeliste ___ . (wpisany)', ['aufgenommen'],
    'in die Liste aufnehmen → wurde ... aufgenommen.', { tags: ['wortschatz-kultur'], stage: ['rejonowy', 'wojewodzki'] }),
  q.mc('v7', 'unesco-wortschatz', 3, 'Die Bauarbeiten am Dom wurden im 16. Jahrhundert ___ und erst im 19. Jahrhundert fortgesetzt.', ['unterbrochen', 'abgebrochen worden', 'unterbrechen', 'gebrochen'], 0,
    'unterbrechen (nierozdzielny) → wurden ... unterbrochen.', { tags: ['passiv-praet'], stage: ['rejonowy', 'wojewodzki'] }),
]

export const UNESCO_QUESTIONS: Question[] = [...handcrafted, ...vocab, ...siteToLand, ...landToSite, ...years, ...recognize, ...openCity]
