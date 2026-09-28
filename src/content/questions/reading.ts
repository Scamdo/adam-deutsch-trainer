import type { Question } from '../../types'
import { mkFactory, SRC } from './helpers'

/**
 * Oryginalne teksty napisane dla aplikacji. Struktura odwzorowuje typy zadań z arkuszy MKO
 * (zad. 1-3 i 7 etapu szkolnego, zad. 1, 2, 5 etapu rejonowego) - bez kopiowania treści arkuszy.
 * Tagi exam-* wskazują, z której puli korzysta generator próbnego konkursu.
 */
const q = mkFactory({ category: 'lesen', source: SRC.czytanie, idPrefix: 'lv' })
const T = 'lesen-strategien'

export const READING_QUESTIONS: Question[] = [
  // ===== Szkolny zad. 1: Richtig/Falsch (4) =====
  q.tf('tf1', T, 2,
    'Lena (14) aus Graz hat ein ungewöhnliches Hobby: Sie sammelt alte Schallplatten. Angefangen hat alles vor zwei Jahren, als sie auf dem Dachboden ihrer Großeltern eine Kiste mit Platten aus den Siebzigerjahren gefunden hat. „Zuerst wusste ich gar nicht, wie man sie abspielt“, erzählt sie und lacht. Ihr Opa hat ihr seinen alten Plattenspieler geschenkt, und seitdem verbringt sie fast jedes Wochenende auf Flohmärkten. Inzwischen besitzt sie über 300 Platten. Am liebsten hört sie Jazz, obwohl ihre Freundinnen lieber Popmusik mögen. Neue Platten kauft Lena selten, weil sie ihr zu teuer sind. Ihr Traum ist es, einmal eine eigene Radiosendung zu moderieren.',
    [
      { statement: 'Lena hat die ersten Platten in einem Geschäft gekauft.', answer: false },
      { statement: 'Am Anfang konnte Lena die Platten nicht abspielen.', answer: true },
      { statement: 'Lenas Freundinnen hören am liebsten Jazz.', answer: false },
      { statement: 'Lena kauft fast nie neue Platten.', answer: true },
      { statement: 'Lena arbeitet schon als Moderatorin beim Radio.', answer: false },
    ],
    'Porównuj szczegóły: „Kiste auf dem Dachboden” (nie sklep), „obwohl ihre Freundinnen lieber Popmusik mögen”, „selten” = fast nie, „Traum” = jeszcze nie pracuje.',
    { tags: ['exam-szk-t1', 'richtig-falsch'], stage: ['szkolny', 'rejonowy'] }),
  q.tf('tf2', T, 2,
    'Viele Schulen in Deutschland haben inzwischen ein Handyverbot im Unterricht. An der Gesamtschule in Bielefeld gilt seit letztem Herbst eine neue Regel: Die Schülerinnen und Schüler müssen ihre Smartphones morgens in einen Schrank legen und bekommen sie erst nach der letzten Stunde zurück. Am Anfang waren viele dagegen. „Ich dachte, ich halte das keinen Tag aus“, sagt Jonas aus der achten Klasse. Heute sieht er das anders: In den Pausen spielen die Schüler wieder Tischtennis oder unterhalten sich. Die Lehrer berichten, dass die Klassen ruhiger geworden sind. Nur für Notfälle gibt es eine Ausnahme: Eltern können im Sekretariat anrufen.',
    [
      { statement: 'Die Schüler dürfen ihre Handys in den Pausen benutzen.', answer: false },
      { statement: 'Jonas fand die neue Regel am Anfang schlecht.', answer: true },
      { statement: 'Nach Meinung der Lehrer ist es im Unterricht leiser geworden.', answer: true },
      { statement: 'In einem Notfall können die Schüler ihr Handy aus dem Schrank holen.', answer: false },
    ],
    'Handy dostaje się dopiero po ostatniej lekcji; w nagłych przypadkach dzwonią rodzice do sekretariatu - uczeń nie wyjmuje telefonu.',
    { tags: ['exam-szk-t1', 'richtig-falsch'] }),
  q.tf('tf3', T, 3,
    'Als Paul im Sommer mit seiner Familie nach Norwegen fuhr, wollte er eigentlich gar nicht mit. „Zwei Wochen ohne meine Freunde, und dann auch noch Regen“, dachte er. Doch schon am zweiten Tag änderte sich seine Meinung. Mit seinem Vater machte er eine Kajaktour auf einem Fjord und sah zum ersten Mal in seinem Leben einen Wal – zwar nur aus großer Entfernung, aber das war ihm egal. Das Wetter war tatsächlich oft schlecht, trotzdem gingen sie fast jeden Tag wandern. Am Ende der Reise wollte Paul nicht mehr nach Hause. Jetzt spart er sein Taschengeld, weil er nächstes Jahr mit seinem besten Freund wiederkommen möchte.',
    [
      { statement: 'Paul hat sich von Anfang an auf die Reise gefreut.', answer: false },
      { statement: 'Paul hat den Wal aus der Nähe gesehen.', answer: false },
      { statement: 'Trotz des Regens war die Familie oft draußen unterwegs.', answer: true },
      { statement: 'Paul möchte nächstes Jahr wieder mit seinen Eltern nach Norwegen fahren.', answer: false },
    ],
    'Pułapki: „aus großer Entfernung” (z daleka), „mit seinem besten Freund” (nie z rodzicami).',
    { tags: ['exam-szk-t1', 'richtig-falsch'] }),

  // ===== Szkolny zad. 2: fehlende Sätze (3 z 5) =====
  q.wordbank('ms1', T, 3,
    'Im Winter streuen viele Städte Salz auf die Straßen, damit sie nicht glatt sind. {0} Salz schadet nämlich den Bäumen am Straßenrand und macht Autos schneller rostig. Eine Stadt in Bayern testet deshalb eine neue Idee: Sie benutzt das Salzwasser aus einer Käsefabrik. {1} Früher musste die Fabrik dafür sogar bezahlen. Jetzt holt die Stadt das Wasser kostenlos ab. {2} Die Fahrer der Streufahrzeuge sagen allerdings, dass es manchmal ein bisschen nach Käse riecht.',
    [
      'Doch das ist nicht besonders gut für die Umwelt.',
      'Das Wasser war für den Käse nicht mehr nötig und wurde bisher entsorgt.',
      'So sparen beide Seiten Geld, und die Umwelt profitiert auch.',
      'Im Sommer fahren viele Touristen nach Bayern.',
      'Käse ist in Deutschland sehr beliebt.',
    ], [0, 1, 2],
    'Szukaj łączników: „nämlich” wyjaśnia problem (Doch ... nicht gut); „dafür” odnosi się do usuwania wody; „beide Seiten” podsumowuje miasto i fabrykę.',
    { prompt: 'Wstaw w luki brakujące zdania. Dwa zdania są zbędne.', tags: ['exam-szk-t2', 'fehlende-saetze'] }),
  q.wordbank('ms2', T, 3,
    'Mia ist 13 und hat schon ihr erstes eigenes Buch geschrieben. Die Idee dazu hatte sie während der Corona-Zeit. {0} Deshalb begann sie, Geschichten über ein Mädchen zu schreiben, das mit seinem Hund durch die Zeit reist. Ihre Lehrerin las die ersten Kapitel und war begeistert. {1} Ein kleiner Verlag aus Leipzig fand das Buch so gut, dass er es veröffentlichte. {2} Das Geld, das sie mit dem Buch verdient, spendet sie einem Tierheim.',
    [
      'Sie langweilte sich zu Hause und vermisste ihre Freunde.',
      'Sie schlug Mia vor, das Manuskript an Verlage zu schicken.',
      'Inzwischen hat Mia schon über 2000 Exemplare verkauft.',
      'Mias Hund heißt Bruno und ist drei Jahre alt.',
      'Leipzig liegt in Sachsen.',
    ], [0, 1, 2],
    '„Deshalb” wymaga przyczyny (nuda); „Sie schlug ... vor” nawiązuje do nauczycielki; „Das Geld” - po informacji o sprzedaży.',
    { prompt: 'Wstaw w luki brakujące zdania. Dwa zdania są zbędne.', tags: ['exam-szk-t2', 'fehlende-saetze'] }),
  q.wordbank('ms3', T, 3,
    'Der Bodensee liegt zwischen Deutschland, Österreich und der Schweiz. {0} Jedes Jahr kommen Millionen Touristen, um zu baden, Rad zu fahren oder mit dem Schiff zu fahren. Besonders beliebt ist die Blumeninsel Mainau. {1} Dort wachsen Palmen, Orangenbäume und tausende Rosen. Aber der See ist nicht nur ein Ferienziel. {2} Rund vier Millionen Menschen bekommen ihr Trinkwasser aus dem Bodensee.',
    [
      'Er ist einer der größten Seen Mitteleuropas.',
      'Wegen des milden Klimas fühlen sich hier sogar Pflanzen aus dem Süden wohl.',
      'Er ist auch ein wichtiger Wasserspeicher.',
      'Im Winter ist der See oft komplett zugefroren.',
      'Viele Touristen fahren lieber an die Ostsee.',
    ], [0, 1, 2],
    '„Er” = der See; „Dort wachsen Palmen” wymaga wyjaśnienia (łagodny klimat); „nicht nur ... Ferienziel” → „auch ein wichtiger Wasserspeicher”.',
    { prompt: 'Wstaw w luki brakujące zdania. Dwa zdania są zbędne.', tags: ['exam-szk-t2', 'fehlende-saetze'] }),

  // ===== Szkolny zad. 3: Frage-Antwort (5 z 7) =====
  q.match('qa1', T, 2, [
    ['Worauf freust du dich in den Ferien am meisten?', 'Auf die Zeit am Meer mit meiner Familie.'],
    ['Wessen Idee war der Ausflug nach Potsdam?', 'Die von unserer Klassenlehrerin.'],
    ['Wie lange hast du für das Referat gebraucht?', 'Ungefähr drei Nachmittage.'],
    ['Warum warst du gestern nicht beim Training?', 'Ich hatte Halsschmerzen.'],
    ['Wobei hilfst du deinen Eltern zu Hause?', 'Beim Kochen und beim Einkaufen.'],
  ], 'Łącz po przyimku (Worauf → Auf, Wobei → Beim), po typie informacji (Wessen → czyja, Wie lange → czas, Warum → przyczyna).',
    { prompt: 'Dopasuj odpowiedzi do pytań. Dwie odpowiedzi są zbędne.', extra: ['Mit dem Zug um halb acht.', 'Nach meinem Kuli.'], tags: ['exam-szk-t3', 'frage-antwort', 'wo-plus'] }),
  q.match('qa2', T, 3, [
    ['Wonach riecht es hier so gut?', 'Nach frischem Brot aus dem Ofen.'],
    ['Woran denkst du gerade?', 'An die Mathearbeit morgen.'],
    ['Mit wem gehst du ins Konzert?', 'Mit meiner Cousine aus Linz.'],
    ['Wie weit ist es bis zum Schloss?', 'Nur etwa zehn Minuten zu Fuß.'],
    ['Wie oft trainierst du?', 'Dreimal pro Woche.'],
  ], 'Wonach → Nach...; Woran → An...; Mit wem → osoba; Wie weit → odległość; Wie oft → częstotliwość.',
    { prompt: 'Dopasuj odpowiedzi do pytań. Dwie odpowiedzi są zbędne.', extra: ['Seit zwei Jahren.', 'Auf meinen Bruder.'], tags: ['exam-szk-t3', 'frage-antwort', 'wo-plus'] }),
  q.match('qa3', T, 3, [
    ['Worüber habt ihr so lange gesprochen?', 'Über unsere Pläne für die Klassenfahrt.'],
    ['Wem gehört das rote Fahrrad?', 'Meinem Nachbarn.'],
    ['Wofür brauchst du so viel Geld?', 'Für ein neues Handy.'],
    ['Ist Tim schon größer als sein Vater?', 'Nein, aber fast genauso groß.'],
    ['Kennst du den neuen Schüler?', 'Ja, er wohnt in meiner Straße.'],
  ], 'Wem gehört → Dativ (Meinem Nachbarn); porównanie → odpowiedź z „genauso groß”; „Kennst du...” → informacja o osobie.',
    { prompt: 'Dopasuj odpowiedzi do pytań. Dwie odpowiedzi są zbędne.', extra: ['Um acht Uhr abends.', 'Auf die Party am Samstag.'], tags: ['exam-szk-t3', 'frage-antwort'] }),

  // ===== Szkolny zad. 7: Lückentext A/B/C (5) =====
  q.reading('cz1', T, 2, 'Reisen im eigenen Zimmer',
    'Nicht jeder kann in den Ferien in ferne Länder fliegen. Eine (1) ___ Idee aus Frankreich zeigt, dass man auch zu Hause reisen kann. Schon im 18. Jahrhundert schrieb ein Autor ein Buch über eine „Reise“ durch sein eigenes Zimmer. Die (2) ___ dahinter: Wer genau hinschaut, entdeckt auch im Alltag Neues. Man kann zum Beispiel jeden Gegenstand im Zimmer betrachten und sich fragen, woher er kommt. So kann man viel über andere Länder (3) ___. Eine Tasse aus China, ein Stein vom Strand in Kroatien oder eine (4) ___ vom Urlaub an der Ostsee – jedes Ding hat eine Geschichte. Man muss sie sich nur genau (5) ___.',
    [
      { q: '(1)', options: ['bekannte', 'bekannten', 'bekanntes'], answer: 0 },
      { q: '(2)', options: ['Bedeutung', 'Botschaft', 'Meinung'], answer: 1 },
      { q: '(3)', options: ['lernen', 'lehren', 'studieren'], answer: 0 },
      { q: '(4)', options: ['Muschel', 'Mütze', 'Münze'], answer: 0 },
      { q: '(5)', options: ['anschauen', 'angeschaut', 'anschaut'], answer: 0 },
    ],
    '(1) eine + Nom f → -e; (2) „przesłanie” pomysłu = Botschaft; (3) etwas über ... lernen; (4) z plaży nad Bałtykiem - muszla; (5) muss + bezokolicznik.',
    { prompt: 'Wybierz wyraz, który poprawnie uzupełnia każdą lukę w tekście.', tags: ['exam-szk-t7', 'lueckentext'], category: 'wortschatz' }),
  q.reading('cz2', T, 3, 'Warum werden wir rot?',
    'Fast jeder kennt das Gefühl: Man muss vor der Klasse sprechen, und plötzlich wird das Gesicht ganz heiß. Rot werden ist eine ganz normale (1) ___ des Körpers. Wenn wir uns schämen oder nervös sind, (2) ___ die Blutgefäße im Gesicht weiter. Dadurch fließt mehr Blut durch die Haut, und sie sieht rot aus. Forscher glauben, dass das Rotwerden eine wichtige Funktion hat: Es zeigt anderen Menschen, dass uns ein Fehler (3) ___ ist. Deshalb reagieren die anderen meistens (4) ___ und verzeihen uns schneller. Wer oft rot wird, sollte sich also keine (5) ___ machen.',
    [
      { q: '(1)', options: ['Reaktion', 'Ursache', 'Krankheit'], answer: 0 },
      { q: '(2)', options: ['werden', 'wird', 'sind'], answer: 0 },
      { q: '(3)', options: ['peinlich', 'wichtig', 'langweilig'], answer: 0 },
      { q: '(4)', options: ['freundlich', 'freundlicher', 'Freundlichkeit'], answer: 0 },
      { q: '(5)', options: ['Sorgen', 'Angst', 'Probleme'], answer: 0 },
    ],
    '(1) reakcja organizmu; (2) die Blutgefäße (Pl) werden weiter; (3) jemandem peinlich sein; (4) przysłówek po reagieren; (5) sich Sorgen machen (kolokacja).',
    { prompt: 'Wybierz wyraz, który poprawnie uzupełnia każdą lukę w tekście.', tags: ['exam-szk-t7', 'lueckentext'], category: 'wortschatz' }),
  q.reading('cz3', T, 3, 'Die Insel Rügen',
    'Rügen ist die (1) ___ Insel Deutschlands und liegt in der Ostsee. Jedes Jahr verbringen hier viele Familien ihren Sommerurlaub. Besonders (2) ___ sind die weißen Kreidefelsen im Nationalpark Jasmund. Der Maler Caspar David Friedrich hat sie schon vor über 200 Jahren auf einem berühmten Bild (3) ___. Wer nicht nur am Strand liegen möchte, kann auf der Insel wandern oder Rad fahren. Viele Touristen fahren auch mit der kleinen Dampfeisenbahn, (4) ___ die Einheimischen „Rasender Roland“ nennen. Am Abend (5) ___ man in einem der Fischrestaurants frischen Fisch essen.',
    [
      { q: '(1)', options: ['größte', 'größere', 'große'], answer: 0 },
      { q: '(2)', options: ['bekannt', 'bekannte', 'bekannten'], answer: 0 },
      { q: '(3)', options: ['gemalt', 'gemacht', 'gezeichnet haben'], answer: 0 },
      { q: '(4)', options: ['die', 'der', 'den'], answer: 0 },
      { q: '(5)', options: ['kann', 'muss', 'darf nicht'], answer: 0 },
    ],
    '(1) największa wyspa: die größte; (2) orzecznik po sind → bez końcówki; (3) ein Bild malen → gemalt; (4) die Eisenbahn (f), Akk → die; (5) sens: można.',
    { prompt: 'Wybierz wyraz, który poprawnie uzupełnia każdą lukę w tekście.', tags: ['exam-szk-t7', 'lueckentext'], category: 'wortschatz' }),

  // ===== Rejonowy zad. 1: Überschriften (6 z 8) =====
  q.match('hd1', T, 3, [
    ['Der Dom in dieser Stadt am Rhein wurde über 600 Jahre lang gebaut. Mit seinen zwei Türmen ist er heute das Wahrzeichen der Stadt und eine der meistbesuchten Sehenswürdigkeiten Deutschlands.', 'Eine Baustelle über Jahrhunderte'],
    ['In einer alten Kohlezeche in Essen arbeitet heute niemand mehr unter Tage. Stattdessen gibt es dort Museen, Konzerte und sogar eine Eisbahn im Winter.', 'Vom Bergwerk zum Kulturort'],
    ['Auf einer Insel in der Spree stehen fünf große Museen nebeneinander. Hier kann man Kunst und Schätze aus 6000 Jahren Menschheitsgeschichte bewundern.', 'Schätze aus vielen Jahrtausenden'],
    ['Zwischen Bingen und Koblenz fließt der Fluss durch ein enges Tal mit Burgen, Weinbergen und kleinen Städten. Eine Sage erzählt von einer schönen Frau auf einem Felsen.', 'Burgen, Wein und eine Legende'],
    ['Ein junger König ließ im 19. Jahrhundert in den Bergen ein Märchenschloss bauen. Er selbst wohnte dort nur wenige Monate.', 'Ein Traum aus Stein'],
    ['An der Nordseeküste zieht sich das Meer zweimal am Tag zurück. Dann kann man mit einem Führer über den Meeresboden wandern.', 'Spaziergang auf dem Meeresboden'],
  ], 'Nagłówek = główna myśl akapitu. Pułapki to nagłówki z pojedynczym słowem z tekstu.',
    { prompt: 'Dopasuj nagłówki do tekstów. Dwa nagłówki są zbędne.', extra: ['Ein Schloss für die Touristen von heute', 'Die höchsten Berge Deutschlands'], tags: ['exam-rej-t1', 'ueberschriften'], stage: ['rejonowy'], category: 'lesen' }),
  q.match('hd2', T, 3, [
    ['In diesem Kloster in Baden-Württemberg sieht alles noch fast so aus wie im Mittelalter. Die Mönche lebten hier vom 12. Jahrhundert an. Heute ist die Anlage das am besten erhaltene Kloster seiner Art nördlich der Alpen.', 'Zeitreise ins Mittelalter'],
    ['Die Stadt an der Donau hat den Zweiten Weltkrieg fast ohne Zerstörungen überstanden. Deshalb kann man hier mittelalterliche Häuser, Türme und eine alte Steinerne Brücke sehen.', 'Vom Krieg verschont'],
    ['Vor fast 50 Millionen Jahren lag hier ein See. In seinem Schlamm sind Tiere und Pflanzen so gut erhalten geblieben, dass man sogar den Mageninhalt eines Urpferdchens untersuchen kann.', 'Ein Fenster in die Urzeit'],
    ['Die Hütte in Völklingen produzierte über 100 Jahre lang Roheisen. 1986 wurde sie stillgelegt. Heute gehen Besucher dort auf Hochöfen spazieren.', 'Wo früher Eisen floss'],
    ['In diesem Park bei Potsdam ließ sich ein preußischer König ein Sommerschloss bauen. Sein Name bedeutet auf Französisch „ohne Sorge“.', 'Ein Ort ohne Sorgen'],
    ['Zwei Hansestädte an der Ostsee zeigen mit ihren Backsteinkirchen und Giebelhäusern, wie reich die Kaufleute im Mittelalter waren.', 'Backstein und Handel'],
  ], 'Szukaj myśli przewodniej: „so aus wie im Mittelalter” → podróż w czasie; „fast ohne Zerstörungen” → oszczędzony przez wojnę; „ohne Sorge” = Sanssouci.',
    { prompt: 'Dopasuj nagłówki do tekstów. Dwa nagłówki są zbędne.', extra: ['Ein moderner Freizeitpark', 'Die längste Brücke Europas'], tags: ['exam-rej-t1', 'ueberschriften'], stage: ['rejonowy'], category: 'lesen' }),

  // ===== Rejonowy zad. 2: R/F (6) =====
  q.tf('tf6a', T, 3,
    'Liebe Leserinnen und Leser, letzte Woche war unsere Klasse drei Tage in Goslar im Harz. Am ersten Tag haben wir die Altstadt besichtigt. Unsere Stadtführerin hat erzählt, dass Goslar früher sehr reich war, weil man im Rammelsberg Silber, Kupfer und Blei fand. Am zweiten Tag sind wir selbst in das alte Bergwerk gefahren – mit einer kleinen Grubenbahn! Unter der Erde war es ziemlich kalt, nur etwa 12 Grad, obwohl draußen die Sonne schien. Das Bergwerk ist seit 1988 geschlossen und heute ein Museum. Am letzten Tag wollten wir eigentlich auf den Brocken wandern, aber es hat so stark geregnet, dass wir stattdessen ins Kaiserpfalz-Museum gegangen sind. Das fanden am Ende sogar die Jungs spannend! Eure Lea',
    [
      { statement: 'Die Klasse war eine Woche lang in Goslar.', answer: false },
      { statement: 'Goslar wurde durch den Bergbau reich.', answer: true },
      { statement: 'Im Bergwerk war es wärmer als draußen.', answer: false },
      { statement: 'Im Rammelsberg wird heute kein Erz mehr abgebaut.', answer: true },
      { statement: 'Die Klasse ist auf den Brocken gewandert.', answer: false },
      { statement: 'Das Museum hat auch den Jungen gefallen.', answer: true },
    ],
    'Szczegóły: „drei Tage” (nie tydzień); 12 stopni pod ziemią mimo słońca; „wollten eigentlich” = nie poszli na Brocken.',
    { tags: ['exam-rej-t2', 'richtig-falsch', 'unesco'], stage: ['rejonowy'] }),
  q.tf('tf6b', T, 3,
    'Der Wiener Maler und Architekt Friedensreich Hundertwasser mochte keine geraden Linien. „Die gerade Linie ist gottlos“, soll er gesagt haben. Seine Häuser sind deshalb bunt, haben schiefe Böden und Bäume auf den Dächern. Das bekannteste ist das Hundertwasserhaus in Wien, in dem bis heute ganz normale Menschen wohnen. Weil so viele Touristen kommen, dürfen Besucher allerdings nicht hinein. Gegenüber gibt es aber ein Einkaufszentrum im gleichen Stil. Hundertwasser hat nicht nur in Österreich gebaut: In Magdeburg steht zum Beispiel die „Grüne Zitadelle“, sein letztes Werk, das erst nach seinem Tod fertig wurde. Er starb im Jahr 2000 auf einer Schiffsreise im Pazifik. Die letzten Jahrzehnte seines Lebens hatte er vor allem in Neuseeland verbracht.',
    [
      { statement: 'Hundertwasser baute Häuser mit vielen geraden Linien.', answer: false },
      { statement: 'Im Hundertwasserhaus in Wien gibt es Wohnungen.', answer: true },
      { statement: 'Touristen können das Hundertwasserhaus von innen besichtigen.', answer: false },
      { statement: 'Hundertwasser hat nur in Österreich gearbeitet.', answer: false },
      { statement: 'Die „Grüne Zitadelle“ wurde nach Hundertwassers Tod fertiggestellt.', answer: true },
      { statement: 'Hundertwasser starb in Wien.', answer: false },
    ],
    '„dürfen Besucher nicht hinein”; „nicht nur in Österreich”; zmarł na statku podczas rejsu po Pacyfiku, nie w Wiedniu.',
    { tags: ['exam-rej-t2', 'richtig-falsch'], stage: ['rejonowy', 'wojewodzki'] }),

  // ===== Rejonowy zad. 5: Wortbank 7 z 10 =====
  q.wordbank('wbk1', T, 3,
    'Der Kölner Dom ist eine der bekanntesten {0} Deutschlands. Mit dem Bau wurde im Jahr 1248 {1}, doch erst 1880 war die Kirche fertig. Jahrhundertelang stand auf dem Südturm ein alter Holzkran, weil die {2} unterbrochen waren. Im 19. Jahrhundert wurde der Dom nach alten Plänen {3}. Im Zweiten Weltkrieg wurde die Stadt stark {4}, aber der Dom blieb stehen. Seit 1996 {5} er zum UNESCO-Welterbe. Wer die 533 Stufen bis zur Aussichtsplattform im Südturm schafft, hat einen herrlichen {6} über die Stadt.',
    ['Sehenswürdigkeiten', 'begonnen', 'Bauarbeiten', 'vollendet', 'zerstört', 'gehört', 'Blick', 'gebaut hat', 'Aussicht', 'billig'],
    [0, 1, 2, 3, 4, 5, 6],
    'Sprawdzaj formę gramatyczną: „wurde ... begonnen/vollendet/zerstört” (Passiv), „gehört zu” (3. os.), „einen Blick” (Akk m). „Aussicht” jest rodzaju żeńskiego (eine Aussicht) - nie pasuje do „einen herrlichen”.',
    { tags: ['exam-rej-t5', 'wortbank', 'unesco'], stage: ['rejonowy'], category: 'wortschatz' }),
  q.wordbank('wbk2', T, 3,
    'Das Obere Mittelrheintal zwischen Bingen und Koblenz ist etwa 65 Kilometer {0}. Auf den Hügeln über dem Fluss stehen über 40 Burgen und Schlösser, von denen viele heute {1} sind. An den steilen Hängen {2} seit Jahrhunderten Wein angebaut. Die bekannteste Stelle ist der Loreley-Felsen. Laut einer alten {3} saß dort eine schöne Frau, die mit ihrem Gesang die Schiffer {4}. Die Männer schauten nur noch nach oben und ihre Schiffe {5} an den Felsen. Heute fahren hier viele Ausflugsschiffe, und Touristen genießen die romantische {6}.',
    ['lang', 'Ruinen', 'wird', 'Sage', 'ablenkte', 'zerschellten', 'Landschaft', 'werden', 'breit', 'Geschichte hat'],
    [0, 1, 2, 3, 4, 5, 6],
    '„etwa 65 Kilometer lang” (długość doliny); Wein (l.poj.) → wird angebaut; „laut einer Sage”; Präteritum w opowieści: ablenkte, zerschellten.',
    { tags: ['exam-rej-t5', 'wortbank', 'unesco'], stage: ['rejonowy'], category: 'wortschatz' }),

  // ===== Leseverstehen A-D (woj./ogólne) =====
  q.reading('rd1', T, 3, 'Granfluencer',
    'Auf Instagram und TikTok sind nicht nur Jugendliche aktiv. Immer mehr ältere Menschen werden dort zu Stars – man nennt sie „Granfluencer“, eine Mischung aus „Grandma/Grandpa“ und „Influencer“. Die 88-jährige Hildegard aus Hamburg zum Beispiel zeigt jede Woche, wie man klassische norddeutsche Gerichte kocht. Die Idee hatte ihr Enkel, der die Videos filmt und schneidet. Inzwischen folgen ihr über 400 000 Menschen, die meisten davon sind zwischen 20 und 35 Jahre alt. Viele schreiben ihr, dass sie sie an ihre eigene Oma erinnert. Geld ist für Hildegard nicht wichtig: „Ich freue mich, wenn junge Leute wieder selbst kochen.“ Kritiker meinen allerdings, dass manche Familien ihre Großeltern nur für Werbung benutzen.',
    [
      { q: 'Wer hatte die Idee zu Hildegards Videos?', options: ['Hildegard selbst', 'ihr Enkel', 'eine Werbeagentur', 'ihre Freundin'], answer: 1 },
      { q: 'Wie alt sind die meisten Follower von Hildegard?', options: ['unter 20', 'zwischen 20 und 35', 'über 60', 'etwa 88'], answer: 1 },
      { q: 'Was ist für Hildegard am wichtigsten?', options: ['viel Geld zu verdienen', 'berühmt zu werden', 'dass junge Menschen kochen', 'neue Rezepte zu erfinden'], answer: 2 },
      { q: 'Was kritisieren manche Menschen?', options: ['die schlechte Qualität der Videos', 'dass ältere Menschen für Werbung benutzt werden', 'dass die Rezepte zu schwierig sind', 'dass Senioren keine Handys haben'], answer: 1 },
    ],
    'Odpowiedzi znajdziesz w kolejnych zdaniach tekstu - kolejność pytań odpowiada kolejności informacji.',
    { tags: ['lesen-mc'], stage: ['rejonowy', 'wojewodzki'] }),
  q.reading('rd2', T, 3, 'Hotel Mama',
    'In Deutschland ziehen junge Menschen immer später von zu Hause aus. Im Durchschnitt verlassen sie das Elternhaus mit etwa 24 Jahren – das ist früher als in Italien oder Polen, aber später als in Skandinavien. Junge Frauen ziehen im Schnitt fast zwei Jahre früher aus als junge Männer. Ein wichtiger Grund sind die hohen Mieten in Großstädten wie München oder Hamburg. Viele Studierende bleiben deshalb bei ihren Eltern wohnen, wenn die Universität in derselben Stadt liegt. Psychologen sehen darin kein großes Problem, solange die jungen Erwachsenen im Haushalt mithelfen und selbstständig werden.',
    [
      { q: 'Im Vergleich zu Skandinavien ziehen junge Deutsche ...', options: ['früher aus.', 'später aus.', 'genauso früh aus.', 'gar nicht aus.'], answer: 1 },
      { q: 'Wer zieht in Deutschland früher aus?', options: ['junge Männer', 'junge Frauen', 'Studierende', 'Menschen in München'], answer: 1 },
      { q: 'Warum bleiben viele Studierende zu Hause?', options: ['weil sie ihre Eltern vermissen', 'weil die Wohnungen in Großstädten teuer sind', 'weil es keine Universitäten gibt', 'weil Psychologen es empfehlen'], answer: 1 },
      { q: 'Was meinen Psychologen?', options: ['Es ist immer ein Problem.', 'Es ist kein Problem, wenn die jungen Leute mithelfen.', 'Junge Leute sollten mit 18 ausziehen.', 'Eltern sollten Miete verlangen.'], answer: 1 },
    ],
    'Uwaga na porównania (früher als / später als) i warunek „solange ...”.',
    { tags: ['lesen-mc'], stage: ['wojewodzki'] }),
]
