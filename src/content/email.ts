/** Zadania pisemne w stylu zad. 9 etapu szkolnego (oryginalne sytuacje). */

export interface WritingTask {
  id: string
  kind: 'E-Mail' | 'Blogeintrag'
  situation: string // PL - jak w arkuszu
  points: string[] // 3 elementy treści
  model: string // przykładowa odpowiedź DE (ok. 80-100 słów)
  phrases: string[]
}

export const WRITING_TASKS: WritingTask[] = [
  {
    id: 'w1',
    kind: 'E-Mail',
    situation: 'Wróciłeś/Wróciłaś z tygodniowego obozu językowego w Austrii. Napisz e-mail do kolegi z Niemiec, Maxa.',
    points: ['Opisz, gdzie mieszkałeś/mieszkałaś i jak tam było.', 'Napisz o jednej niespodziewanej sytuacji, która się wydarzyła.', 'Zaproponuj Maxowi wspólny wyjazd na obóz w przyszłym roku.'],
    model: 'Lieber Max,\nich bin gerade aus dem Sprachcamp in Österreich zurück! Wir haben in einer Jugendherberge direkt am Wolfgangsee gewohnt. Die Zimmer waren klein, aber gemütlich, und das Essen war wirklich lecker.\nStell dir vor: Am dritten Tag hat unser Bus auf dem Weg nach Salzburg eine Panne gehabt. Wir mussten zwei Stunden warten, aber wir haben zusammen Lieder gesungen und viel gelacht.\nHast du Lust, nächstes Jahr mit mir zusammen in das Camp zu fahren? Das wäre super! Schreib mir bald.\nViele Grüße\nXYZ',
    phrases: ['Wir haben in ... gewohnt.', 'Stell dir vor: ...', 'Hast du Lust, ... zu ...?', 'Das wäre super!'],
  },
  {
    id: 'w2',
    kind: 'Blogeintrag',
    situation: 'Prowadzisz szkolnego bloga. Napisz wpis o swojej ulubionej książce.',
    points: ['Poleć książkę czytelnikom i napisz, o czym jest.', 'Wyjaśnij, dlaczego warto czytać książki zamiast oglądać filmy.', 'Poproś czytelników o komentarze z ich ulubionymi książkami.'],
    model: 'Liebe Leserinnen und Leser,\nheute möchte ich euch mein Lieblingsbuch empfehlen: „Tschick“ von Wolfgang Herrndorf. Es geht um zwei Jungen, die in den Sommerferien mit einem alten Auto durch Ostdeutschland fahren und viele Abenteuer erleben.\nIch finde, dass Bücher oft besser als Filme sind, weil man seine eigene Fantasie benutzen muss. Außerdem lernt man beim Lesen viele neue Wörter.\nWelche Bücher lest ihr gern? Schreibt eure Lieblingsbücher in die Kommentare! Ich freue mich auf eure Tipps.\nEuer XYZ',
    phrases: ['Heute möchte ich euch ... empfehlen.', 'Es geht um ...', 'Ich finde, dass ...', 'Schreibt ... in die Kommentare!'],
  },
  {
    id: 'w3',
    kind: 'E-Mail',
    situation: 'Twoja koleżanka z Berlina, Lena, odwiedziła cię w zeszłym tygodniu w Warszawie. Napisz do niej e-mail.',
    points: ['Podziękuj za odwiedziny i napisz, co ci się najbardziej podobało.', 'Opowiedz, co wydarzyło się w szkole po jej wyjeździe.', 'Zaproponuj termin i plan kolejnego spotkania.'],
    model: 'Liebe Lena,\nvielen Dank für deinen Besuch! Am besten hat mir unser Ausflug in die Altstadt gefallen, besonders das Eis am Marktplatz.\nNach deiner Abreise war in der Schule viel los: Wir haben einen Mathetest geschrieben, und unsere Klasse hat beim Volleyballturnier den zweiten Platz gemacht. Alle haben nach dir gefragt!\nWie wäre es, wenn ich dich in den Winterferien in Berlin besuche? Wir könnten zusammen auf den Weihnachtsmarkt gehen und die Museumsinsel besichtigen.\nLiebe Grüße\nXYZ',
    phrases: ['Vielen Dank für ...', 'Am besten hat mir ... gefallen.', 'Wie wäre es, wenn ...?', 'Wir könnten ...'],
  },
  {
    id: 'w4',
    kind: 'E-Mail',
    situation: 'Bierzesz udział w szkolnym projekcie „Sprzątamy nasze miasto”. Napisz e-mail do znajomego z Austrii, Tobiasa.',
    points: ['Wyjaśnij, na czym polega projekt i dlaczego w nim uczestniczysz.', 'Napisz, co cię martwi w związku z projektem.', 'Zaproś Tobiasa do śledzenia projektu w internecie.'],
    model: 'Hallo Tobias,\nwie geht es dir? Ich mache gerade bei einem Schulprojekt mit. Es heißt „Wir räumen unsere Stadt auf“. Jeden Samstag sammeln wir Müll in Parks und am Flussufer. Ich mache mit, weil mir die Umwelt wichtig ist.\nIch habe aber ein bisschen Angst, dass zu wenige Schüler mitmachen. Letzte Woche waren wir nur acht Personen, und es gab so viel Müll!\nWir haben eine Instagram-Seite, auf der wir Fotos posten. Folg uns doch und schreib uns einen Kommentar!\nBis bald\nXYZ',
    phrases: ['Ich mache bei ... mit.', 'Es geht darum, dass ...', 'Ich habe Angst, dass ...', 'Folg uns doch ...!'],
  },
  {
    id: 'w5',
    kind: 'E-Mail',
    situation: 'Byłeś/Byłaś z rodzicami na weekendzie w Berlinie. Napisz e-mail do przyjaciółki z Niemiec, Anny.',
    points: ['Opisz hotel, w którym mieszkaliście.', 'Opisz problem, który przydarzył się podczas zwiedzania.', 'Zaproś Annę do Polski.'],
    model: 'Liebe Anna,\nletztes Wochenende war ich mit meinen Eltern in Berlin! Unser Hotel lag direkt am Alexanderplatz. Das Zimmer war modern und wir hatten einen tollen Blick auf den Fernsehturm.\nLeider hatten wir beim Sightseeing ein Problem: Mein Vater hat im Bus seine Geldbörse verloren. Zum Glück hat ein freundlicher Busfahrer sie gefunden, und wir haben sie am nächsten Tag zurückbekommen.\nMöchtest du mich im Sommer in Polen besuchen? Ich zeige dir gern Warschau und wir können an die Ostsee fahren.\nViele Grüße\nXYZ',
    phrases: ['Unser Hotel lag ...', 'Leider hatten wir ein Problem: ...', 'Zum Glück ...', 'Möchtest du mich ... besuchen?'],
  },
]

/** Automatyczne sprawdzenia techniczne (heurystyki, nie zastępują oceny) */
export function writingChecks(text: string): { ok: boolean; label: string }[] {
  const t = text.trim()
  const lines = t.split(/\n+/).map((l) => l.trim()).filter(Boolean)
  const words = t.split(/\s+/).filter(Boolean).length
  const first = lines[0] ?? ''
  const second = lines[1] ?? ''
  const last = lines[lines.length - 1] ?? ''
  const hasAnrede = /^(Liebe|Lieber|Hallo|Hi|Sehr geehrte|Sehr geehrter|Liebe Leserinnen)/.test(first)
  const lowerAfterComma = !first.endsWith(',') || /^[a-zäöü]/.test(second)
  const hasGruss = /(Grüße|Grüßen|Bis bald|Tschüs|Ciao|Dein|Deine|Euer|Eure)/.test(t)
  const xyz = /XYZ\s*$/.test(t) || last === 'XYZ' || /\bXYZ\b/.test(last)
  return [
    { ok: words >= 50 && words <= 140, label: `Długość: ${words} słów (bezpiecznie: 60-110)` },
    { ok: hasAnrede, label: 'Zwrot na początku (Liebe/Lieber/Hallo ...)' },
    { ok: lowerAfterComma, label: 'Po przecinku w nagłówku - mała litera w następnej linii' },
    { ok: hasGruss, label: 'Formuła pożegnalna (Viele Grüße / Liebe Grüße ...)' },
    { ok: xyz, label: 'Podpis XYZ (nie własne imię!)' },
  ]
}
