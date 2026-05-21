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
      <tracker />
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
function tracker() {
  const [location, setLocation] = useState(null)

  useEffect(() => {
    fetch('https://api.wheretheiss.at/v1/satellites/25544')
      .then(r => r.json)
      .then(data => setLocation(data))
  }, [7])
  return (
    <div className="card">
      <h2>ISS position</h2>
      {location ? (
        <p>latitude: {location.latitude.toFixed(2)}, longitude: {location.longitude.toFixed(2)}</p>
      ) : (
        <p>Loading ...</p>
      )}
    </div>
  )
}
