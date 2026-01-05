import path from "node:path";

const env = (k, d) => process.env[k] ?? d;

export const PORT       = Number(env("PORT", "3000"));
export const MOVIES_DIR = env("MOVIES_DIR", "/media/movies");
export const SERIES_DIR = env("SERIES_DIR", "/media/series");
export const PHOTOS_DIR = env("PHOTOS_DIR", "/media/photos");

export const ROOTS = {
  movies: path.resolve(MOVIES_DIR),
  series: path.resolve(SERIES_DIR),
  photos: path.resolve(PHOTOS_DIR),
};
