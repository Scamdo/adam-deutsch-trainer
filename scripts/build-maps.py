"""Generuje src/data/maps.ts z uproszczonych granic Natural Earth (domena publiczna).
Rzutowanie: prosty equirectangular z korekcją cos(lat0) - wystarczające dla D-A-CH
i pozwala rzutować współrzędne obiektów w przeglądarce bez bibliotek."""
import json, math
src = json.load(open('scripts/dach-admin1.geojson'))

def build(countries, width, pad=8):
    feats = [f for f in src['features'] if f['properties']['country'] in countries]
    pts = []
    def rings(g):
        if g['type'] == 'Polygon': return g['coordinates']
        return [r for poly in g['coordinates'] for r in poly]
    for f in feats:
        for r in rings(f['geometry']): pts += r
    lons = [p[0] for p in pts]; lats = [p[1] for p in pts]
    lon0, lon1, lat0, lat1 = min(lons), max(lons), min(lats), max(lats)
    c = math.cos(math.radians((lat0 + lat1) / 2))
    k = (width - 2 * pad) / ((lon1 - lon0) * c)
    height = round((lat1 - lat0) * k + 2 * pad)
    def pr(lon, lat): return ((lon - lon0) * c * k + pad, (lat1 - lat) * k + pad)
    regions = []
    for f in feats:
        d = ''
        for r in rings(f['geometry']):
            d += 'M' + 'L'.join('%.1f,%.1f' % pr(*p) for p in r) + 'Z'
        p = f['properties']
        name = p['name_de'] or p['name']
        name = name.replace('Kanton ', '').replace('Freie Hansestadt ', '')
        regions.append({'iso': p['iso'], 'name': name, 'country': p['country'], 'd': d})
    return {'width': width, 'height': height, 'lon0': lon0, 'lat1': lat1, 'c': c, 'k': k, 'pad': pad, 'regions': regions}

out = {'DE': build(['DE'], 520), 'AT': build(['AT'], 640), 'CH': build(['CH'], 640), 'DACH': build(['DE', 'AT', 'CH'], 620)}
with open('src/data/maps.ts', 'w') as fh:
    fh.write('// AUTO-GENERATED przez scripts/build-maps.py - granice: Natural Earth (public domain)\n')
    fh.write('export interface MapRegion { iso: string; name: string; country: string; d: string }\n')
    fh.write('export interface MapDef { width: number; height: number; lon0: number; lat1: number; c: number; k: number; pad: number; regions: MapRegion[] }\n')
    fh.write('export const MAPS: Record<"DE" | "AT" | "CH" | "DACH", MapDef> = ' + json.dumps(out, ensure_ascii=False) + '\n')
print({k: (v['width'], v['height'], len(v['regions'])) for k, v in out.items()})
