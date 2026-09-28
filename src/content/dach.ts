/** Fakty D-A-CH - zweryfikowane dane podstawowe (stolice, liczby) używane w module Landeskunde. */

export interface Region {
  iso: string
  name: string
  capital: string
  note: string
}

export const BUNDESLAENDER: Region[] = [
  { iso: 'DE-BW', name: 'Baden-Württemberg', capital: 'Stuttgart', note: 'Schwarzwald, Bodensee, Autoindustrie (Mercedes, Porsche)' },
  { iso: 'DE-BY', name: 'Bayern', capital: 'München', note: 'Flächenmäßig größtes Bundesland; Zugspitze, Oktoberfest, Neuschwanstein' },
  { iso: 'DE-BE', name: 'Berlin', capital: 'Berlin', note: 'Stadtstaat und Bundeshauptstadt; Spree, Brandenburger Tor' },
  { iso: 'DE-BB', name: 'Brandenburg', capital: 'Potsdam', note: 'Umgibt Berlin; Schloss Sanssouci in Potsdam' },
  { iso: 'DE-HB', name: 'Bremen', capital: 'Bremen', note: 'Kleinstes Bundesland; Stadtstaat aus Bremen und Bremerhaven; Roland, Stadtmusikanten' },
  { iso: 'DE-HH', name: 'Hamburg', capital: 'Hamburg', note: 'Stadtstaat; größter Hafen Deutschlands; Elbphilharmonie, Speicherstadt' },
  { iso: 'DE-HE', name: 'Hessen', capital: 'Wiesbaden', note: 'Frankfurt am Main (Banken, Flughafen) ist die größte Stadt, aber nicht die Hauptstadt' },
  { iso: 'DE-MV', name: 'Mecklenburg-Vorpommern', capital: 'Schwerin', note: 'Rügen (größte Insel Deutschlands), Müritz, Ostseeküste' },
  { iso: 'DE-NI', name: 'Niedersachsen', capital: 'Hannover', note: 'Harz (Goslar), Lüneburger Heide, Wattenmeer, Volkswagen in Wolfsburg' },
  { iso: 'DE-NW', name: 'Nordrhein-Westfalen', capital: 'Düsseldorf', note: 'Bevölkerungsreichstes Bundesland; Köln, Ruhrgebiet, Aachen' },
  { iso: 'DE-RP', name: 'Rheinland-Pfalz', capital: 'Mainz', note: 'Mittelrheintal, Loreley, Trier (älteste Stadt Deutschlands), Weinbau' },
  { iso: 'DE-SL', name: 'Saarland', capital: 'Saarbrücken', note: 'Kleinstes Flächenland; Grenze zu Frankreich und Luxemburg; Völklinger Hütte' },
  { iso: 'DE-SN', name: 'Sachsen', capital: 'Dresden', note: 'Dresden = „Elbflorenz“; Meißner Porzellan; Leipzig' },
  { iso: 'DE-ST', name: 'Sachsen-Anhalt', capital: 'Magdeburg', note: 'Lutherstadt Wittenberg, Quedlinburg, Bauhaus Dessau' },
  { iso: 'DE-SH', name: 'Schleswig-Holstein', capital: 'Kiel', note: 'Zwischen Nord- und Ostsee; Sylt, Lübeck (Marzipan)' },
  { iso: 'DE-TH', name: 'Thüringen', capital: 'Erfurt', note: 'Weimar (Goethe, Schiller), Wartburg bei Eisenach' },
]

export const OESTERREICH_LAENDER: Region[] = [
  { iso: 'AT-9', name: 'Wien', capital: 'Wien', note: 'Bundeshauptstadt und eigenes Bundesland; Stephansdom, Schönbrunn' },
  { iso: 'AT-3', name: 'Niederösterreich', capital: 'St. Pölten', note: 'Flächenmäßig größtes Bundesland; Wachau an der Donau' },
  { iso: 'AT-4', name: 'Oberösterreich', capital: 'Linz', note: 'Linz an der Donau; Salzkammergut (Hallstatt)' },
  { iso: 'AT-5', name: 'Salzburg', capital: 'Salzburg', note: 'Geburtsstadt Mozarts (1756); Salzburger Festspiele' },
  { iso: 'AT-7', name: 'Tirol', capital: 'Innsbruck', note: 'Alpen, Wintersport; Innsbruck am Inn' },
  { iso: 'AT-8', name: 'Vorarlberg', capital: 'Bregenz', note: 'Westlichstes Bundesland; Bodensee, Bregenzer Festspiele' },
  { iso: 'AT-2', name: 'Kärnten', capital: 'Klagenfurt', note: 'Wörthersee; Grenze zu Italien und Slowenien' },
  { iso: 'AT-6', name: 'Steiermark', capital: 'Graz', note: '„Grüne Mark“; Graz ist die zweitgrößte Stadt Österreichs' },
  { iso: 'AT-1', name: 'Burgenland', capital: 'Eisenstadt', note: 'Östlichstes Bundesland; Neusiedler See; Joseph Haydn' },
]

export interface FactCard {
  country: 'DE' | 'AT' | 'CH' | 'LI'
  label: string
  value: string
}

export const FACTS: FactCard[] = [
  { country: 'DE', label: 'Offizieller Name', value: 'Bundesrepublik Deutschland' },
  { country: 'DE', label: 'Hauptstadt', value: 'Berlin' },
  { country: 'DE', label: 'Bundesländer', value: '16 (davon 3 Stadtstaaten: Berlin, Hamburg, Bremen)' },
  { country: 'DE', label: 'Höchster Berg', value: 'Zugspitze, 2962 m (Bayern)' },
  { country: 'DE', label: 'Längster Fluss in Deutschland', value: 'Rhein (ca. 865 km auf deutschem Gebiet)' },
  { country: 'DE', label: 'Größter See', value: 'Bodensee (mit A und CH); größter See ganz in D: Müritz' },
  { country: 'DE', label: 'Größte Insel', value: 'Rügen (Ostsee)' },
  { country: 'DE', label: 'Nachbarländer', value: '9: Dänemark, Polen, Tschechien, Österreich, Schweiz, Frankreich, Luxemburg, Belgien, Niederlande' },
  { country: 'DE', label: 'Nationalfeiertag', value: '3. Oktober – Tag der Deutschen Einheit (1990)' },
  { country: 'AT', label: 'Offizieller Name', value: 'Republik Österreich' },
  { country: 'AT', label: 'Hauptstadt', value: 'Wien (an der Donau)' },
  { country: 'AT', label: 'Bundesländer', value: '9' },
  { country: 'AT', label: 'Höchster Berg', value: 'Großglockner, 3798 m' },
  { country: 'AT', label: 'Nationalfeiertag', value: '26. Oktober (Neutralität, 1955)' },
  { country: 'AT', label: 'EU-Mitglied seit', value: '1995' },
  { country: 'CH', label: 'Offizieller Name', value: 'Schweizerische Eidgenossenschaft (CH = Confoederatio Helvetica)' },
  { country: 'CH', label: 'Bundesstadt', value: 'Bern (offiziell keine „Hauptstadt“, sondern Bundesstadt)' },
  { country: 'CH', label: 'Kantone', value: '26' },
  { country: 'CH', label: 'Amtssprachen', value: 'Deutsch, Französisch, Italienisch, Rätoromanisch' },
  { country: 'CH', label: 'Höchster Berg', value: 'Dufourspitze (Monte Rosa), 4634 m; bekanntester: Matterhorn' },
  { country: 'CH', label: 'Währung', value: 'Schweizer Franken (CHF); kein EU-Mitglied' },
  { country: 'CH', label: 'Nationalfeiertag', value: '1. August (Rütlischwur 1291)' },
  { country: 'LI', label: 'Liechtenstein', value: 'Fürstentum, Hauptstadt Vaduz, Amtssprache Deutsch, Währung CHF' },
]
