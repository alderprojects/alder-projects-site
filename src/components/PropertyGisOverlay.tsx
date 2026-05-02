'use client'

import { useEffect, useState } from 'react'

// Live overlays from public Vermont/federal GIS endpoints.
//
// - Geocodes the address through the VT E911 composite geocoder (VCGI).
// - Queries FEMA flood zones and three ANR Atlas layers (shoreland buffer,
//   river corridor, wetlands) by intersecting the geocoded point.
//
// Runs entirely client-side: ANR Atlas does not require auth and the
// geocoder is open. Server-side calls would just relay the same requests
// at the cost of an extra hop and a cold start. Everything has a tight
// abort timeout — these endpoints occasionally hang.

const SUGGEST = 'https://maps.vcgi.vermont.gov/arcgis/rest/services/EGC_services/GCS_E911_COMPOSITE_SP_v2/GeocodeServer/findAddressCandidates'
const ANR = 'https://anrmaps.vermont.gov/arcgis/rest/services/Open_Data'

type Gis = {
  geocoded: boolean
  lat?: number
  lng?: number
  matchScore?: number
  floodZone?: string
  inFloodZone?: boolean
  inShoreland?: boolean
  inRiverCorridor?: boolean
  inWetland?: boolean
}

async function fetchGis(address: string): Promise<Gis> {
  try {
    const params = `SingleLine=${encodeURIComponent(address)}&f=json&maxLocations=1&outSR=4326`
    const g = await fetch(`${SUGGEST}?${params}`, { signal: AbortSignal.timeout(8000) })
    const d = await g.json()
    const c = d.candidates?.[0]
    if (!c || c.score < 60) return { geocoded: false }
    const lat = c.location.y as number
    const lng = c.location.x as number
    const q = `geometry=${lng},${lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&f=json&inSR=4326&returnGeometry=false`
    const [fl, sh, rv, wt] = await Promise.all([
      fetch(`${ANR}/OPENDATA_ANR_EMERGENCY_SP_NOCACHE_v2/MapServer/57/query?${q}&outFields=FLD_ZONE,SFHA_TF`, {
        signal: AbortSignal.timeout(5000),
      })
        .then(r => r.json())
        .catch(() => ({ features: [] })),
      fetch(`${ANR}/OPENDATA_ANR_WATER_SP_NOCACHE_v2/MapServer/175/query?${q}&outFields=OBJECTID`, {
        signal: AbortSignal.timeout(5000),
      })
        .then(r => r.json())
        .catch(() => ({ features: [] })),
      fetch(`${ANR}/OPENDATA_ANR_WATER_SP_NOCACHE_v2/MapServer/176/query?${q}&outFields=OBJECTID`, {
        signal: AbortSignal.timeout(5000),
      })
        .then(r => r.json())
        .catch(() => ({ features: [] })),
      fetch(
        `${ANR}/OPENDATA_ANR_WATER_SP_NOCACHE_v2/MapServer/193/query?${q}&outFields=OBJECTID&distance=100&units=esriSRUnit_Meter`,
        { signal: AbortSignal.timeout(5000) }
      )
        .then(r => r.json())
        .catch(() => ({ features: [] })),
    ])
    const fa = fl.features?.[0]?.attributes as Record<string, string> | undefined
    return {
      geocoded: true,
      lat,
      lng,
      matchScore: c.score,
      floodZone: fa?.FLD_ZONE,
      inFloodZone: (fl.features?.length ?? 0) > 0 && fa?.SFHA_TF === 'T',
      inShoreland: (sh.features?.length ?? 0) > 0,
      inRiverCorridor: (rv.features?.length ?? 0) > 0,
      inWetland: (wt.features?.length ?? 0) > 0,
    }
  } catch {
    return { geocoded: false }
  }
}

const C = {
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  okBg: '#EAF3DE',
  okInk: '#3B6D11',
  warnBg: '#FAEEDA',
  warnInk: '#854F0B',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

export default function PropertyGisOverlay({ address }: { address: string }) {
  const [gis, setGis] = useState<Gis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchGis(address).then(g => {
      if (cancelled) return
      setGis(g)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [address])

  return (
    <div
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 6,
        padding: '14px 18px',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 14, fontFamily: FB, color: C.ink, fontWeight: 600, margin: 0 }}>
          Live overlays — FEMA + Vermont ANR Atlas
        </p>
        <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, margin: 0 }}>
          {loading ? 'Checking…' : gis?.geocoded ? 'Public data, free' : 'Could not geocode'}
        </p>
      </div>
      {!loading && gis?.geocoded && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Pill ok={!gis.inFloodZone} label={gis.inFloodZone ? `Flood zone ${gis.floodZone || ''}` : 'No flood zone'} />
          <Pill ok={!gis.inShoreland} label={gis.inShoreland ? 'Shoreland buffer applies' : 'No shoreland'} />
          <Pill ok={!gis.inRiverCorridor} label={gis.inRiverCorridor ? 'In river corridor' : 'No river corridor'} />
          <Pill ok={!gis.inWetland} label={gis.inWetland ? 'Wetland within 100m' : 'No wetland nearby'} />
        </div>
      )}
      {!loading && !gis?.geocoded && (
        <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: 0, lineHeight: 1.5 }}>
          The Vermont E911 geocoder did not return a confident match for this address — overlays skipped. The narrative
          flags above still apply.
        </p>
      )}
    </div>
  )
}

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontFamily: FB,
        padding: '4px 10px',
        borderRadius: 999,
        backgroundColor: ok ? C.okBg : C.warnBg,
        color: ok ? C.okInk : C.warnInk,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: ok ? C.okInk : C.warnInk,
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  )
}
