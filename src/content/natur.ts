/**
 * Naturdenkmale & Nationalparks - temat etapu wojewódzkiego 2026/27.
 * Program: „wybrane pomniki przyrody (Naturdenkmale/Naturdenkmäler) w Niemczech: historia, położenie,
 * przynależność do krajów związkowych, walory turystyczne, ciekawostki”. Źródła programu:
 * Wikipedia „Naturdenkmal”, BfN (Nationale Naturmonumente), BMUV (Nationalparke), momondo/kayak/skyscanner (Naturwunder).
 * Moduł jest przygotowaniem architektury i bazy - do rozbudowy przed marcem 2027.
 */

export interface NatureSite {
  id: string
  name: string
  namePl: string
  type: 'Felsen' | 'Klamm' | 'See' | 'Nationalpark' | 'Baum' | 'Quelle' | 'Wasserfall' | 'Küste' | 'Fluss'
  lands: string[]
  lat: number
  lon: number
  info: string // PL
  deutsch: string
  facts: string[]
  keywords: string[]
}

export const NATURE_BASICS = [
  'Naturdenkmal (pomnik przyrody) = pojedynczy twór przyrody pod ochroną: drzewo, skała, źródło, jaskinia, wodospad. Obszary do 5 ha to Flächennaturdenkmal.',
  'Pojęcie wprowadził Alexander von Humboldt („monumens de la nature”, 1814). Spopularyzował je botanik Hugo Conwentz (memoriał 1904).',
  'Ochrona prawna: konstytucja weimarska (1919), Reichsnaturschutzgesetz (1935), dziś § 28 Bundesnaturschutzgesetz (BNatSchG).',
  'Nationales Naturmonument - wyższa kategoria ochrony (od 2010), np. Ivenacker Eichen (2016, pierwszy) i Bruchhauser Steine (2017).',
  'Niemcy mają 16 parków narodowych. Pierwszy: Bayerischer Wald (1970). Jedyny alpejski: Berchtesgaden (1978).',
]

export const NATURE_SITES: NatureSite[] = [
  { id: 'jasmund', name: 'Kreidefelsen im Nationalpark Jasmund', namePl: 'Klify kredowe w PN Jasmund', type: 'Küste', lands: ['DE-MV'], lat: 54.573, lon: 13.665,
    info: 'Białe klify kredowe na Rugii z Königsstuhl (ok. 118 m n.p.m.). Najmniejszy park narodowy Niemiec (od 1990). Namalował je Caspar David Friedrich (1818).',
    deutsch: 'Die Kreidefelsen auf Rügen gehören zum Nationalpark Jasmund in Mecklenburg-Vorpommern. Der bekannteste Felsen heißt Königsstuhl. Caspar David Friedrich hat die Felsen um 1818 gemalt.',
    facts: ['Najmniejszy park narodowy w Niemczech', 'Buki Jasmund są częścią UNESCO (lasy bukowe)'], keywords: ['Rügen', 'Königsstuhl', 'Caspar David Friedrich', 'Kreide'] },
  { id: 'bastei', name: 'Bastei (Sächsische Schweiz)', namePl: 'Bastei w Saskiej Szwajcarii', type: 'Felsen', lands: ['DE-SN'], lat: 50.962, lon: 14.073,
    info: 'Formacja skał piaskowcowych ok. 194 m nad Łabą w Górach Połabskich. Kamienny most Basteibrücke z 1851 r. Park Narodowy Saska Szwajcaria (1990).',
    deutsch: 'Die Bastei ist eine Felsformation aus Sandstein im Elbsandsteingebirge in Sachsen. Sie liegt etwa 194 Meter über der Elbe. Die steinerne Basteibrücke wurde 1851 gebaut.',
    facts: ['Jedno z najczęściej odwiedzanych miejsc przyrodniczych w Niemczech', 'Kolebka wspinaczki skałkowej'], keywords: ['Elbsandsteingebirge', 'Basteibrücke', 'Elbe', 'Sandstein'] },
  { id: 'externsteine', name: 'Externsteine', namePl: 'Externsteine', type: 'Felsen', lands: ['DE-NW'], lat: 51.869, lon: 8.917,
    info: 'Grupa skał piaskowcowych w Lesie Teutoburskim (ok. 40 m) z reliefem Zdjęcia z Krzyża z ok. 1120 r.',
    deutsch: 'Die Externsteine sind eine Gruppe von Sandsteinfelsen im Teutoburger Wald in Nordrhein-Westfalen. Sie sind bis zu 40 Meter hoch. Ein mittelalterliches Relief zeigt die Kreuzabnahme Jesu.',
    facts: ['Owiane legendami miejsce kultu'], keywords: ['Teutoburger Wald', 'Relief', 'Sandsteinfelsen'] },
  { id: 'partnachklamm', name: 'Partnachklamm', namePl: 'Wąwóz Partnach', type: 'Klamm', lands: ['DE-BY'], lat: 47.47, lon: 11.115,
    info: 'Wąwóz o długości ok. 700 m i głębokości do ok. 80 m koło Garmisch-Partenkirchen. Pomnik przyrody od 1912 r.',
    deutsch: 'Die Partnachklamm bei Garmisch-Partenkirchen in Bayern ist etwa 700 Meter lang und bis zu 80 Meter tief. Seit 1912 ist sie ein Naturdenkmal.',
    facts: ['Zimą zamienia się w świat lodowych sopli'], keywords: ['Garmisch-Partenkirchen', 'Schlucht', '1912'] },
  { id: 'breitachklamm', name: 'Breitachklamm', namePl: 'Wąwóz Breitach', type: 'Klamm', lands: ['DE-BY'], lat: 47.393, lon: 10.254,
    info: 'Jeden z najgłębszych wąwozów Europy Środkowej (do ok. 150 m) koło Oberstdorfu w Allgäu.',
    deutsch: 'Die Breitachklamm bei Oberstdorf im Allgäu gehört zu den tiefsten Felsschluchten Mitteleuropas.',
    facts: ['Udostępniona w 1905 r.'], keywords: ['Oberstdorf', 'Allgäu', 'tiefste Schlucht'] },
  { id: 'koenigssee', name: 'Königssee (Nationalpark Berchtesgaden)', namePl: 'Königssee', type: 'See', lands: ['DE-BY'], lat: 47.55, lon: 12.98,
    info: 'Polodowcowe jezioro u stóp Watzmanna (2713 m) w jedynym alpejskim parku narodowym Niemiec (1978). Słynne echo i kościółek St. Bartholomä.',
    deutsch: 'Der Königssee liegt im Nationalpark Berchtesgaden, dem einzigen Alpen-Nationalpark Deutschlands. Auf dem See fahren nur Elektroboote. Berühmt ist das Echo am Königssee.',
    facts: ['Pływają tylko łodzie elektryczne', 'Na łodzi grana jest trąbka dla echa'], keywords: ['Watzmann', 'St. Bartholomä', 'Echo', 'Berchtesgaden'] },
  { id: 'blautopf', name: 'Blautopf', namePl: 'Blautopf', type: 'Quelle', lands: ['DE-BW'], lat: 48.416, lon: 9.784,
    info: 'Krasowe źródło w Blaubeuren o intensywnie niebieskim kolorze. Legenda o pięknej Lau (Eduard Mörike).',
    deutsch: 'Der Blautopf in Blaubeuren in Baden-Württemberg ist eine Karstquelle mit einer intensiv blauen Farbe. Eine Sage erzählt von der schönen Lau.',
    facts: ['Za źródłem ciągnie się ogromny system jaskiń'], keywords: ['Blaubeuren', 'Karstquelle', 'schöne Lau', 'blau'] },
  { id: 'triberg', name: 'Triberger Wasserfälle', namePl: 'Wodospady Triberg', type: 'Wasserfall', lands: ['DE-BW'], lat: 48.13, lon: 8.23,
    info: 'Jedne z najwyższych wodospadów Niemiec w Schwarzwaldzie (łącznie ok. 163 m na kilku kaskadach).',
    deutsch: 'Die Triberger Wasserfälle im Schwarzwald gehören zu den höchsten Wasserfällen Deutschlands. Das Wasser fällt über sieben Stufen.',
    facts: ['W okolicy - zegary z kukułką'], keywords: ['Schwarzwald', 'Stufen', 'Wasserfall'] },
  { id: 'ivenack', name: 'Ivenacker Eichen', namePl: 'Dęby z Ivenack', type: 'Baum', lands: ['DE-MV'], lat: 53.735, lon: 12.97,
    info: 'Prastare dęby (najstarszy ok. 1000 lat). Pierwszy Nationales Naturmonument w Niemczech (2016). Ścieżka w koronach drzew.',
    deutsch: 'Die Ivenacker Eichen in Mecklenburg-Vorpommern sind bis zu 1000 Jahre alt. 2016 wurden sie das erste Nationale Naturmonument Deutschlands.',
    facts: ['Pierwszy Nationales Naturmonument (2016)'], keywords: ['Eichen', '1000 Jahre', 'erstes Nationales Naturmonument'] },
  { id: 'bruchhausen', name: 'Bruchhauser Steine', namePl: 'Skały Bruchhausen', type: 'Felsen', lands: ['DE-NW'], lat: 51.316, lon: 8.54,
    info: 'Cztery potężne skały porfirowe w Sauerlandzie. Nationales Naturmonument od 2017 r.',
    deutsch: 'Die Bruchhauser Steine sind vier große Felsen im Sauerland in Nordrhein-Westfalen. Seit 2017 sind sie ein Nationales Naturmonument.',
    facts: ['Drugi Nationales Naturmonument w Niemczech'], keywords: ['Sauerland', 'vier Felsen', '2017'] },
  { id: 'teufelsmauer', name: 'Teufelsmauer', namePl: 'Diabelski Mur', type: 'Felsen', lands: ['DE-ST'], lat: 51.79, lon: 11.05,
    info: 'Ciągnący się ok. 20 km mur skał piaskowcowych na skraju Harzu. Chroniony od 1852 r. - jeden z najstarszych przykładów ochrony przyrody w Niemczech.',
    deutsch: 'Die Teufelsmauer im Harzvorland in Sachsen-Anhalt ist eine lange Felsformation aus Sandstein. Sie steht schon seit 1852 unter Schutz.',
    facts: ['Legenda: mur zbudował diabeł'], keywords: ['Harz', 'Teufel', '1852'] },
  { id: 'saarschleife', name: 'Saarschleife', namePl: 'Pętla Saary', type: 'Fluss', lands: ['DE-SL'], lat: 49.505, lon: 6.55,
    info: 'Malownicze zakole rzeki Saary koło Mettlach. Widok z punktu Cloef i ścieżki w koronach drzew.',
    deutsch: 'Die Saarschleife bei Mettlach ist das bekannteste Naturwunder im Saarland. Von einem Baumwipfelpfad hat man einen tollen Blick auf die Flussschleife.',
    facts: ['Symbol Saary'], keywords: ['Mettlach', 'Flussschleife', 'Baumwipfelpfad'] },
  { id: 'muritz', name: 'Müritz (Müritz-Nationalpark)', namePl: 'Jezioro Müritz', type: 'See', lands: ['DE-MV'], lat: 53.42, lon: 12.68,
    info: 'Największe jezioro leżące w całości w Niemczech. Park Narodowy Müritz - raj dla orłów i żurawi.',
    deutsch: 'Die Müritz ist der größte See, der vollständig in Deutschland liegt. Im Müritz-Nationalpark leben Seeadler und Kraniche.',
    facts: ['Bodensee jest większe, ale dzielone z Austrią i Szwajcarią'], keywords: ['größter See in Deutschland', 'Seeadler', 'Kraniche'] },
  { id: 'bayerwald', name: 'Nationalpark Bayerischer Wald', namePl: 'Park Narodowy Lasu Bawarskiego', type: 'Nationalpark', lands: ['DE-BY'], lat: 48.95, lon: 13.4,
    info: 'Pierwszy park narodowy Niemiec (1970), razem z czeskim Szumawskim tworzy największy obszar leśny Europy Środkowej.',
    deutsch: 'Der Nationalpark Bayerischer Wald wurde 1970 als erster Nationalpark Deutschlands gegründet. Motto: „Natur Natur sein lassen“.',
    facts: ['Pierwszy PN w Niemczech (1970)', 'Motto: „Natur Natur sein lassen”'], keywords: ['erster Nationalpark', '1970', 'Böhmerwald'] },
  { id: 'harz', name: 'Nationalpark Harz mit dem Brocken', namePl: 'Park Narodowy Harz i Brocken', type: 'Nationalpark', lands: ['DE-ST', 'DE-NI'], lat: 51.8, lon: 10.617,
    info: 'Park obejmuje najwyższy szczyt północnych Niemiec - Brocken (1141 m). Na szczyt jeździ kolej wąskotorowa Brockenbahn. Legenda o czarownicach (noc Walpurgii).',
    deutsch: 'Der Brocken ist mit 1141 Metern der höchste Berg im Harz. Mit der Brockenbahn, einer Dampflok, kann man bis auf den Gipfel fahren. In der Walpurgisnacht treffen sich dort der Sage nach die Hexen.',
    facts: ['Brocken występuje w „Fauście” Goethego', 'Park w dwóch krajach związkowych'], keywords: ['Brocken', 'Hexen', 'Brockenbahn', 'Walpurgisnacht'] },
  { id: 'helgoland', name: 'Lange Anna (Helgoland)', namePl: 'Lange Anna na Helgolandzie', type: 'Küste', lands: ['DE-SH'], lat: 54.188, lon: 7.873,
    info: 'Wolnostojąca iglica z czerwonego piaskowca (ok. 47 m) na Helgolandzie - jedynej niemieckiej wyspie pełnomorskiej.',
    deutsch: 'Die Lange Anna ist ein 47 Meter hoher Felsen aus rotem Sandstein auf Helgoland. Sie ist das Wahrzeichen der Insel.',
    facts: ['Helgoland - wyspa bez samochodów'], keywords: ['Helgoland', 'roter Sandstein', 'Hochseeinsel'] },
  { id: 'hainich', name: 'Nationalpark Hainich', namePl: 'Park Narodowy Hainich', type: 'Nationalpark', lands: ['DE-TH'], lat: 51.08, lon: 10.45,
    info: 'Stary las bukowy w Turyngii (część UNESCO) ze ścieżką w koronach drzew (Baumkronenpfad).',
    deutsch: 'Im Nationalpark Hainich in Thüringen wächst ein alter Buchenwald. Auf dem Baumkronenpfad kann man durch die Baumkronen spazieren.',
    facts: ['Część UNESCO „Alte Buchenwälder”'], keywords: ['Baumkronenpfad', 'Buchenwald', 'Thüringen'] },
]

export const NATURE_BY_ID: Record<string, NatureSite> = Object.fromEntries(NATURE_SITES.map((n) => [n.id, n]))
