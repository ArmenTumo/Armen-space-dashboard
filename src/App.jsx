import './App.css'
export default function kkk(){
  return (
    <div className="dashboard">
      <h1>Armen-space-dashboard</h1>
      <p>20.05.2026</p>
      <Kamo latitude="42.36" longitude="-71.05" />
      <Karen name="Artemis 2" status="Active" />
      <Tak name="ISS Expidition 71" status="Ongoing" />
    </div>
  )
}
function Kamo(props){
 return (
  <div className="card">
   <h2>{props.latitude}</h2>
   <p>{props.longitude}</p>
  </div>
 )
}
function Karen(props){
  return (
<div className="warning">
<h3>{props.name}</h3>
  <p>{props.status}</p>
</div>

  )
}
function Tak(props){
  return (
<div className="card">
<h3>{props.name}</h3>
  <p>{props.status}</p>
</div>

  )
}