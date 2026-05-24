import './App.css'
import { useState, useEffect } from 'react'
export default function kkk() {
  return (
    <div className="dashboard">
      <h1>Armen-space-dashboard</h1>
      <p>20.05.2026</p>
      <Kamo latitude="42.36" longitude="-71.05" />
      <Karen name="Artemis 2" status="Active" />
      <Tak name="ISS Expidition 71" status="Ongoing" />
      <Conter />
      <ISSTracker2 />
      <PeopleInSpace />
      <APOD />
      <SolarSystem />
    </div>
  )
}
function Kamo(props) {
  return (
    <div className="card">
      <h2>{props.latitude}</h2>
      <p>{props.longitude}</p>
    </div>
  )
}
function Karen(props) {
  return (
    <div className="warning">
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
function Conter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  )
}

function ISSTracker2() {
  const [location, setLocation] = useState(null)

  useEffect(() => {
    fetch(`https://api.wheretheiss.at/v1/satellites/25544/apod?api_key=${import.meta.env.VITE_NASA_KEY}`)
      .then(r => r.json())
      .then(data => setLocation(data))
  }, [])

  return (
    <div className='card'>
      <h2>ISS Position </h2>

      {location ? (
        <p>
          {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
        </p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}
function PeopleInSpace() {
  const [people, setPeople] = useState(null)

  useEffect(() => {
    fetch('http://api.open-notify.org/astros.json')
      .then(r => r.json())
      .then(data => setPeople(data.people))
  }, [])

  return (
    <div className="card">
      <h2>People in Space</h2>
      {people ? (
        <ul>
          {people.map(person => (
            <li key={person.name}>
              {person.name} - {person.craft}
            </li>
          ))}
        </ul>
      ) : <p>Loading...</p>}
    </div>
  )
}
function APOD() {
  const [pic, setPic] = useState(null)

  useEffect(() => {
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${import.meta.env.VITE_NASA_KEY}`)
      .then(r => r.json())
      .then(data => setPic(data))
  }, [])

  return (
    <div className="card">
      <h2>Picture of the Day</h2>
      {pic ? (
        <div>
          <h3>{pic.title}</h3>
          {pic.media_type == 'image'
            ? <img src={pic.url} alt={pic.title} style={{ width: '100%' }} />
            : <a href={pic.url} target="_blank">Watch video</a>
          }
        </div>
      ) : <p>Loading...</p>}
    </div>
  )
}
function SolarSystem() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="https://eyes.nasa.gov/apps/solar-system/#/sc_osiris_rex?rate=1814400&time=2021-02-17T21:06:45.412+00:00"
        title="NASA"
        style={{
          width: "100%",
          height: "100%",
          border: "none"
        }}
      />
    </div>
  )
}
