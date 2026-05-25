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