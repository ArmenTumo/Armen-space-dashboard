import './App.css'
import { useState, useEffect, useRef } from 'react'

export default function App() {
  return (
    <div className="dashboard">
      <div className="topbar">
        <h1>Armen Space Dashboard</h1>
        <p className="date">{today()}</p>
      </div>

      <div className="card-row">
        <Kamo latitude="42.36" longitude="-71.05" />
        <Karen name="Artemis II" status="Active" />
        <Tak name="ISS Expedition 71" status="Ongoing" />
      </div>

      <Counter />
      <ISSTracker />
      <PeopleInSpace />
      <APOD />
      <Asteroids />

      {/* ===== NEW COMPONENTS ===== */}
      <div className="card-row">
        <MoonPhase />
        <MarsWeather />
        <SunInfo />
      </div>

      <NextLaunch />
      <SpaceNews />
      <ISSLiveFeed />

      <SolarSystem />
    </div>
  )
}

/* ================= HELPERS ================= */

function today() {
  return new Date().toISOString().slice(0, 10)
}

function fmt(n, digits = 0) {
  return Number(n).toLocaleString(undefined, {
    maximumFractionDigits: digits,
  })
}

/* ================= SIMPLE COMPONENTS ================= */

function Kamo(props) {
  return (
    <div className="card">
      <h2>Coordinates</h2>
      <p>Latitude: {props.latitude}</p>
      <p>Longitude: {props.longitude}</p>
    </div>
  )
}

function Karen(props) {
  return (
    <div className="card">
      <h2>Status</h2>
      <h3>{props.name}</h3>
      <p>{props.status}</p>
    </div>
  )
}

function Tak(props) {
  return (
    <div className="card">
      <h3>{props.name}</h3>
      <p>{props.status}</p>
    </div>
  )
}

/* ================= COUNTER ================= */

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button className="counter-btn" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  )
}

/* ================= ISS TRACKER ================= */

function ISSTracker() {
  const [location, setLocation] = useState(null)

  useEffect(() => {
    async function loadISS() {
      try {
        const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
        const data = await res.json()
        setLocation(data)
      } catch (e) {
        console.error(e)
      }
    }

    loadISS()
    const interval = setInterval(loadISS, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card">
      <h2>ISS Position</h2>
      {location ? (
        <>
          <p>Latitude: {location.latitude.toFixed(2)}</p>
          <p>Longitude: {location.longitude.toFixed(2)}</p>
          <p>Velocity: {fmt(location.velocity)} km/h</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

/* ================= PEOPLE IN SPACE ================= */

function PeopleInSpace() {
  const [people, setPeople] = useState(null)

  useEffect(() => {
    fetch('https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json')
      .then(r => r.json())
      .then(data => setPeople(data.people))
      .catch(console.error)
  }, [])

  return (
    <div className="card">
      <h2>People In Space</h2>
      {people ? (
        <ul>
          {people.map(person => (
            <li key={person.name}>👨‍🚀 {person.name}</li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

/* ================= NASA APOD ================= */

function APOD() {
  const [pic, setPic] = useState(null)

  useEffect(() => {
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${import.meta.env.VITE_NASA_KEY}`)
      .then(r => r.json())
      .then(data => setPic(data))
      .catch(console.error)
  }, [])

  return (
    <div className="card">
      <h2>NASA Picture of the Day</h2>
      {pic ? (
        <>
          <h3>{pic.title}</h3>
          {pic.media_type === 'image' ? (
            <img src={pic.url} alt={pic.title} />
          ) : (
            <a href={pic.url} target="_blank" rel="noreferrer">Watch Video</a>
          )}
          <p className="apod-explanation">{pic.explanation}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

/* ================= ASTEROIDS ================= */

function Asteroids() {
  const [asteroids, setAsteroids] = useState([])
  const [hazardousCount, setHazardousCount] = useState(0)
  const canvasRef = useRef(null)

  useEffect(() => {
    async function loadAsteroids() {
      try {
        const date = today()
        const res = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${import.meta.env.VITE_NASA_KEY}`
        )
        const data = await res.json()
        const neos = data.near_earth_objects?.[date] || []
        const sorted = [...neos].sort((a, b) =>
          parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || 0) -
          parseFloat(b.close_approach_data?.[0]?.miss_distance?.kilometers || 0)
        )
        setAsteroids(sorted.slice(0, 8))
        setHazardousCount(neos.filter(n => n.is_potentially_hazardous_asteroid).length)
      } catch (e) {
        console.error(e)
      }
    }
    loadAsteroids()
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !asteroids.length) return
    drawAsteroidMap(canvasRef.current, asteroids)
  }, [asteroids])

  return (
    <div className="card">
      <h2>Near Earth Asteroids</h2>
      <canvas ref={canvasRef} width={260} height={260} className="asteroid-canvas" />
      <div className="asteroid-stats-bar">
        <div className="asteroid-stat-box">
          <h3>{asteroids.length}</h3>
          <p>Closest Objects</p>
        </div>
        <div className="asteroid-stat-box">
          <h3>{hazardousCount}</h3>
          <p>Potentially Hazardous</p>
        </div>
      </div>
      {asteroids.length ? (
        asteroids.slice(0, 5).map(neo => (
          <div key={neo.id} className="asteroid-item">
            <h3>☄ {neo.name.replace(/[()]/g, '')}</h3>
            <p>Miss Distance: {fmt(neo.close_approach_data?.[0]?.miss_distance?.kilometers)} km</p>
          </div>
        ))
      ) : (
        <p>Loading asteroid data...</p>
      )}
    </div>
  )
}

/* ================= CANVAS ================= */

function drawAsteroidMap(canvas, asteroids) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#050816'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.beginPath()
  ctx.arc(130, 130, 20, 0, Math.PI * 2)
  ctx.fillStyle = '#2f81f7'
  ctx.fill()

  asteroids.forEach((neo, i) => {
    const radius = 35 + i * 18
    const angle = (i / asteroids.length) * Math.PI * 2
    const x = 130 + Math.cos(angle) * radius
    const y = 130 + Math.sin(angle) * radius
    const hazardous = neo.is_potentially_hazardous_asteroid
    ctx.beginPath()
    ctx.arc(x, y, hazardous ? 6 : 4, 0, Math.PI * 2)
    ctx.fillStyle = hazardous ? '#ff4d4d' : '#bbbbbb'
    ctx.fill()
  })
}

/* ================= SOLAR SYSTEM ================= */

function SolarSystem() {
  return (
    <div className="card">
      <iframe
        src="https://eyes.nasa.gov/apps/solar-system/#/home"
        title="NASA Solar System"
        style={{
          width: '100%',
          height: 'clamp(300px, 50vw, 700px)',
          border: 'none',
        }}
      />
    </div>
  )
}

/* ================= NEW: MOON PHASE ================= */

function getMoonPhase() {
  // Approximate moon phase calculation
  const now = new Date()
  const knownNewMoon = new Date('2024-01-11T11:57:00Z') // known new moon
  const synodicMonth = 29.53058867
  const daysSince = (now - knownNewMoon) / (1000 * 60 * 60 * 24)
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth
  const fraction = phase / synodicMonth

  let name
  if (fraction < 0.03 || fraction > 0.97) name = '🌑 New Moon'
  else if (fraction < 0.22) name = '🌒 Waxing Crescent'
  else if (fraction < 0.28) name = '🌓 First Quarter'
  else if (fraction < 0.47) name = '🌔 Waxing Gibbous'
  else if (fraction < 0.53) name = '🌕 Full Moon'
  else if (fraction < 0.72) name = '🌖 Waning Gibbous'
  else if (fraction < 0.78) name = '🌗 Last Quarter'
  else name = '🌘 Waning Crescent'

  return { phase, fraction, name }
}

function MoonPhase() {
  const canvasRef = useRef(null)
  const { phase, fraction, name } = getMoonPhase()
  const daysToFull = phase <= 14.77 ? (14.765 - phase).toFixed(1) : (29.53 - phase + 14.765).toFixed(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cx = 60, cy = 60, r = 50

    ctx.clearRect(0, 0, 120, 120)

    // Dark background circle
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = '#0a0a1a'
    ctx.fill()

    // Draw lit portion
    const illum = fraction <= 0.5 ? fraction * 2 : (1 - fraction) * 2
    const waning = fraction > 0.5

    // Draw the lit face
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, Math.PI / 2, (3 * Math.PI) / 2)
    ctx.closePath()
    ctx.fillStyle = '#e8e0c8'
    ctx.fill()

    // Overlay ellipse for the terminator
    ctx.beginPath()
    ctx.ellipse(cx, cy, r * Math.abs(1 - illum * 2), r, 0, 0, Math.PI * 2)
    ctx.fillStyle = waning ? '#e8e0c8' : '#0a0a1a'
    ctx.fill()
    ctx.restore()

    // Crater details
    ctx.globalAlpha = 0.15
    ctx.fillStyle = '#888'
      ;[[20, 30, 8], [55, 25, 5], [70, 60, 10], [35, 65, 6]].forEach(([x, y, rad]) => {
        ctx.beginPath()
        ctx.arc(x, y, rad, 0, Math.PI * 2)
        ctx.fill()
      })
    ctx.globalAlpha = 1
  }, [fraction])

  return (
    <div className="card">
      <h2>Moon Phase</h2>
      <canvas ref={canvasRef} width={120} height={120} className="moon-canvas" />
      <p className="moon-phase-name">{name}</p>
      <p><span className="label">Illumination</span><br />{(Math.sin(Math.PI * fraction) * 100).toFixed(0)}%</p>
      <p><span className="label">Days to Full Moon</span><br />{Math.abs(daysToFull)} days</p>
    </div>
  )
}

/* ================= NEW: MARS WEATHER ================= */

function MarsWeather() {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    // NASA InSight API (may return empty if mission ended; graceful fallback)
    fetch(`https://api.nasa.gov/insight_weather/?api_key=${import.meta.env.VITE_NASA_KEY}&feedtype=json&ver=1.0`)
      .then(r => r.json())
      .then(data => {
        const sols = data.sol_keys
        if (!sols || sols.length === 0) { setError(true); return }
        const latest = sols[sols.length - 1]
        const sol = data[latest]
        setWeather({
          sol: latest,
          avgTemp: sol.AT?.av?.toFixed(1) ?? 'N/A',
          minTemp: sol.AT?.mn?.toFixed(1) ?? 'N/A',
          maxTemp: sol.AT?.mx?.toFixed(1) ?? 'N/A',
          pressure: sol.PRE?.av?.toFixed(0) ?? 'N/A',
          windSpeed: sol.HWS?.av?.toFixed(1) ?? 'N/A',
        })
      })
      .catch(() => setError(true))
  }, [])

  return (
    <div className="card">
      <h2>🔴 Mars Weather</h2>
      {error ? (
        <>
          <p className="label">InSight Mission (ended Dec 2022)</p>
          <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: 8 }}>
            Last recorded avg temp: −60°C<br />
            Pressure: ~700 Pa<br />
            Winds: 5–10 m/s
          </p>
        </>
      ) : weather ? (
        <>
          <p className="label">Sol {weather.sol}</p>
          <p>🌡 Avg: {weather.avgTemp}°C</p>
          <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
            Min: {weather.minTemp}°C / Max: {weather.maxTemp}°C
          </p>
          <p>💨 Wind: {weather.windSpeed} m/s</p>
          <p>📊 Pressure: {weather.pressure} Pa</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

/* ================= NEW: SUN INFO ================= */

function SunInfo() {
  const [sunData, setSunData] = useState(null)

  useEffect(() => {
    // Sunrise/sunset for Boston (matching Kamo's coords)
    fetch('https://api.sunrise-sunset.org/json?lat=42.36&lng=-71.05&formatted=0')
      .then(r => r.json())
      .then(data => {
        const r = data.results
        const rise = new Date(r.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const set = new Date(r.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const dayLen = r.day_length
        const hours = Math.floor(dayLen / 3600)
        const mins = Math.floor((dayLen % 3600) / 60)
        setSunData({ rise, set, dayLen: `${hours}h ${mins}m` })
      })
      .catch(console.error)
  }, [])

  return (
    <div className="card">
      <h2>☀️ Sun / Boston</h2>
      {sunData ? (
        <>
          <p>🌅 Sunrise: {sunData.rise}</p>
          <p>🌇 Sunset: {sunData.set}</p>
          <p><span className="label">Daylight</span><br />{sunData.dayLen}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

/* ================= NEW: NEXT ROCKET LAUNCH ================= */

function NextLaunch() {
  const [launch, setLaunch] = useState(null)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=1&ordering=net&format=json')
      .then(r => r.json())
      .then(data => {
        const l = data.results?.[0]
        if (l) setLaunch(l)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!launch) return
    function tick() {
      const now = Date.now()
      const target = new Date(launch.net).getTime()
      const diff = target - now
      if (diff <= 0) { setCountdown('LAUNCH!'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [launch])

  return (
    <div className="card">
      <h2>🚀 Next Rocket Launch</h2>
      {launch ? (
        <div className="launch-content">
          <div className="launch-name">{launch.name}</div>
          <div className="launch-provider">{launch.launch_service_provider?.name}</div>
          <div className="launch-pad">📍 {launch.pad?.location?.name}</div>
          <div className="launch-countdown">{countdown}</div>
          <div className="label">{new Date(launch.net).toUTCString()}</div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

/* ================= NEW: SPACE NEWS ================= */

function SpaceNews() {
  const [articles, setArticles] = useState([])
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=6&ordering=-published_at')
      .then(r => r.json())
      .then(data => setArticles(data.results || []))
      .catch(console.error)
  }, [])

  return (
    <div className="card">
      <h2>📡 Space News</h2>
      {articles.length ? (
        <div className="news-list">
          {articles.map((a, i) => (
            <div
              key={a.id}
              className={`news-item ${expanded === i ? 'news-expanded' : ''}`}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div className="news-title">{a.title}</div>
              <div className="news-meta">
                <span className="label">{a.news_site}</span>
                <span className="label">{new Date(a.published_at).toLocaleDateString()}</span>
              </div>
              {expanded === i && (
                <div className="news-summary">
                  <p>{a.summary}</p>
                  <a href={a.url} target="_blank" rel="noreferrer" className="news-link">Read full article →</a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading news...</p>
      )}
    </div>
  )
}

/* ================= NEW: ISS LIVE FEED ================= */

function ISSLiveFeed() {
  const [show, setShow] = useState(false)

  return (
    <div className="card">
      <h2>📺 ISS Live Camera</h2>

      <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: 12 }}>
        Live HD stream from the International Space Station (NASA HDEV)
      </p>

      {!show ? (
        <button className="counter-btn" onClick={() => setShow(true)}>
          ▶ Load Live Stream
        </button>
      ) : (
        <div className="iss-feed-wrapper">

          <iframe
            src="https://www.youtube.com/embed/uwXgcTc8oY8?autoplay=1&mute=1"
            width="560"
            height="315"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              width: '100%',
              aspectRatio: '16/9',
              border: 'none',
              borderRadius: 8,
            }}
          />

          <p className="label" style={{ marginTop: 8 }}>
            <span className="live">● LIVE</span> — NASA Johnson Space Center
          </p>

        </div>
      )}
    </div>
  )
}

//comment