function KmForMl(coord) {
   return coord * 0.621;  
}
console.log(KmForMl(10));

function Hi(name, ttt) {
   name = "Hello, my name is Armen."
   ttt = " I am 16 years old and a first-year college student."
    return name+ttt;
}
console.log(Hi());


const issPosition = {
  latitude: 44,
  longitude: 55,

}
console.log(issPosition["latitude"]);
console.log(issPosition["longitude"]);

const asteroids = [
 {name: "2024 AB1", diameter:120, hazardous: false},
{name: "2024 CD2", diameter:45, hazardous: true},
{name: "2024 EF3", diameter:890, hazardous: false},
{name: "2024 GH4", diameter:23, hazardous: true},
]

const names = asteroids.map(person => person.name)
console.log(names);

const hazardousOnly = asteroids.filter(person => person.hazardous)
console.log(hazardousOnly);

const firstTwo = asteroids.slice(0,2)
console.log(firstTwo);

function filtMap(names2, hazardous2) {
    names2 = asteroids.map(person => person.name);
    hazardous2 = asteroids.filter(person => person.hazardous)
    
    return names2 + hazardous2
}
console.log(filtMap());
