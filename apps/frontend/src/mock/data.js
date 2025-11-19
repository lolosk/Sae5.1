// apps/frontend/src/mock/data.js
export const films = [
  { id: 1, title: "Interstellar", year: 2014, cover: "https://picsum.photos/400/600?1", genre:"Sci-Fi", src:"https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 2, title: "Inception",   year: 2010, cover: "https://picsum.photos/400/600?2", genre:"Action", src:"https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 3, title: "Dune",        year: 2021, cover: "https://picsum.photos/400/600?3", genre:"Sci-Fi", src:"https://www.w3schools.com/html/mov_bbb.mp4" }
];

export const series = [
  { id:10, title:"Dark S1",     year:2017, cover:"https://picsum.photos/400/600?4", genre:"Mystery", src:"https://www.w3schools.com/html/mov_bbb.mp4" },
  { id:11, title:"The Expanse", year:2015, cover:"https://picsum.photos/400/600?5", genre:"Sci-Fi",  src:"https://www.w3schools.com/html/mov_bbb.mp4" }
];

export const musiques = [
  { id:100, title:"Starlight",   artist:"Muse",        cover:"https://picsum.photos/400/400?6", src:"https://www.w3schools.com/html/horse.mp3" },
  { id:101, title:"Numb",        artist:"Linkin Park", cover:"https://picsum.photos/400/400?7", src:"https://www.w3schools.com/html/horse.mp3" }
];

export const photos = Array.from({ length: 14 }).map((_, i) => ({
  id: 200 + i,
  src: `https://picsum.photos/seed/p${i}/600/800`,
  date: `2025-0${(i % 9) + 1}-1${i % 10}`,
  place: ["Paris", "Nancy", "Lyon", "Tokyo"][i % 4]
}));
