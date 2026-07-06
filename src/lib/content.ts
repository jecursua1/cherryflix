// ---------------------------------------------------------------------------
// Cherryflix local catalog
// ---------------------------------------------------------------------------
// This is the single source of truth for everything shown on the site.
// To add a title, just add an object to `CATALOG` below. No database needed.
//
//  - Posters/backdrops use picsum.photos placeholders (stable per-seed).
//    Replace `poster`/`backdrop` with your own image URLs anytime.
//  - Videos use Google's public sample MP4s so the player works out of the box.
//    Replace `video` with your own MP4 links (direct .mp4 URLs).
// ---------------------------------------------------------------------------

export type Episode = {
  id: string; // globally unique, used in /watch/[id]
  number: number;
  title: string;
  duration: string;
  video: string;
  thumbnail?: string;
  description?: string;
};

export type Title = {
  slug: string;
  name: string;
  type: "anime" | "movie";
  year: number;
  rating: string; // e.g. "TV-14", "PG-13"
  genres: string[];
  description: string;
  poster: string; // portrait 2:3
  backdrop: string; // landscape 16:9
  featured?: boolean;
  // Movies:
  video?: string;
  duration?: string;
  // Anime series:
  episodes?: Episode[];
};

const V = (name: string) =>
  `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${name}`;

const poster = (seed: string) => `https://picsum.photos/seed/${seed}/400/600`;
const backdrop = (seed: string) => `https://picsum.photos/seed/${seed}-bg/1280/720`;

export const CATALOG: Title[] = [
  {
    slug: "ember-blade",
    name: "Ember Blade",
    type: "anime",
    year: 2024,
    rating: "TV-14",
    genres: ["Action", "Fantasy", "Shounen"],
    featured: true,
    description:
      "A young swordsman inherits a cursed blade that burns with the souls of fallen warriors. To free them, he must climb the Demon Spire and face the ones who forged it.",
    poster: poster("emberblade"),
    backdrop: backdrop("emberblade"),
    episodes: [
      { id: "ember-blade-1", number: 1, title: "The Inheritance", duration: "24m", video: V("BigBuckBunny.mp4"), thumbnail: backdrop("ember1"), description: "Kaito receives his father's blade and learns of its curse." },
      { id: "ember-blade-2", number: 2, title: "First Flame", duration: "24m", video: V("ElephantsDream.mp4"), thumbnail: backdrop("ember2"), description: "A bandit ambush forces Kaito to wield the blade for the first time." },
      { id: "ember-blade-3", number: 3, title: "The Spire Appears", duration: "24m", video: V("ForBiggerBlazes.mp4"), thumbnail: backdrop("ember3"), description: "The Demon Spire rises on the horizon and old enemies stir." },
      { id: "ember-blade-4", number: 4, title: "Souls Within", duration: "24m", video: V("ForBiggerEscapes.mp4"), thumbnail: backdrop("ember4"), description: "Kaito hears the voices of the trapped warriors for the first time." },
    ],
  },
  {
    slug: "neon-samurai",
    name: "Neon Samurai",
    type: "anime",
    year: 2023,
    rating: "TV-MA",
    genres: ["Cyberpunk", "Action", "Sci-Fi"],
    featured: true,
    description:
      "In the sprawling megacity of New Kyoto, a masterless samurai trades her sword for a plasma katana and hunts the corporation that erased her memory.",
    poster: poster("neonsamurai"),
    backdrop: backdrop("neonsamurai"),
    episodes: [
      { id: "neon-samurai-1", number: 1, title: "Rain on Chrome", duration: "25m", video: V("ForBiggerFun.mp4"), thumbnail: backdrop("neon1") },
      { id: "neon-samurai-2", number: 2, title: "Ghost Protocol", duration: "25m", video: V("ForBiggerJoyrides.mp4"), thumbnail: backdrop("neon2") },
      { id: "neon-samurai-3", number: 3, title: "The Broker", duration: "25m", video: V("ForBiggerMeltdowns.mp4"), thumbnail: backdrop("neon3") },
    ],
  },
  {
    slug: "sky-pirates-of-aria",
    name: "Sky Pirates of Aria",
    type: "anime",
    year: 2022,
    rating: "TV-PG",
    genres: ["Adventure", "Fantasy", "Comedy"],
    description:
      "A ragtag crew sails the floating islands of Aria aboard a stolen airship, chasing the legend of a sea that hangs in the sky.",
    poster: poster("skypirates"),
    backdrop: backdrop("skypirates"),
    episodes: [
      { id: "sky-pirates-1", number: 1, title: "All Aboard", duration: "23m", video: V("Sintel.mp4"), thumbnail: backdrop("sky1") },
      { id: "sky-pirates-2", number: 2, title: "The Windless Isle", duration: "23m", video: V("TearsOfSteel.mp4"), thumbnail: backdrop("sky2") },
    ],
  },
  {
    slug: "petals-and-thunder",
    name: "Petals & Thunder",
    type: "anime",
    year: 2025,
    rating: "TV-14",
    genres: ["Romance", "Drama", "Slice of Life"],
    description:
      "Two rival calligraphy students discover that the storms they paint might just be echoes of their own hearts.",
    poster: poster("petals"),
    backdrop: backdrop("petals"),
    episodes: [
      { id: "petals-1", number: 1, title: "Ink and Rain", duration: "22m", video: V("WeAreGoingOnBullrun.mp4"), thumbnail: backdrop("petals1") },
      { id: "petals-2", number: 2, title: "The Contest", duration: "22m", video: V("WhatCarCanYouGetForAGrand.mp4"), thumbnail: backdrop("petals2") },
    ],
  },
  {
    slug: "starfall",
    name: "Starfall",
    type: "movie",
    year: 2024,
    rating: "PG-13",
    genres: ["Sci-Fi", "Drama", "Romance"],
    featured: true,
    description:
      "On the night a comet passes closest to Earth, two strangers in different cities begin to share the same dream — and realize they are running out of time to meet.",
    poster: poster("starfall"),
    backdrop: backdrop("starfall"),
    duration: "1h 52m",
    video: V("VolkswagenGTIReview.mp4"),
  },
  {
    slug: "the-last-lantern",
    name: "The Last Lantern",
    type: "movie",
    year: 2021,
    rating: "PG",
    genres: ["Fantasy", "Adventure", "Family"],
    description:
      "A lantern-maker's daughter journeys into the spirit forest to relight the flame that keeps her village from vanishing.",
    poster: poster("lantern"),
    backdrop: backdrop("lantern"),
    duration: "1h 38m",
    video: V("SubaruOutbackOnStreetAndDirt.mp4"),
  },
  {
    slug: "ronin-zero",
    name: "Ronin Zero",
    type: "movie",
    year: 2023,
    rating: "R",
    genres: ["Action", "Thriller"],
    description:
      "A retired assassin is pulled back into the underworld for one final contract that will cost him everything he rebuilt.",
    poster: poster("roninzero"),
    backdrop: backdrop("roninzero"),
    duration: "2h 04m",
    video: V("ForBiggerBlazes.mp4"),
  },
  {
    slug: "clockwork-hearts",
    name: "Clockwork Hearts",
    type: "movie",
    year: 2022,
    rating: "PG",
    genres: ["Steampunk", "Romance", "Fantasy"],
    description:
      "In a city that runs on wound springs, a clockmaker builds an automaton that learns to love — and to fear the day its mainspring runs down.",
    poster: poster("clockwork"),
    backdrop: backdrop("clockwork"),
    duration: "1h 45m",
    video: V("ForBiggerEscapes.mp4"),
  },
];

// --------------------------- accessors -------------------------------------

export function getFeatured(): Title {
  return CATALOG.find((t) => t.featured) ?? CATALOG[0];
}

export function getBySlug(slug: string): Title | undefined {
  return CATALOG.find((t) => t.slug === slug);
}

export function getByType(type: Title["type"]): Title[] {
  return CATALOG.filter((t) => t.type === type);
}

/** Group titles into Netflix-style rows. */
export function getRows(): { title: string; items: Title[] }[] {
  const byGenre = (g: string) => CATALOG.filter((t) => t.genres.includes(g));
  return [
    { title: "Anime Series", items: getByType("anime") },
    { title: "Movies", items: getByType("movie") },
    { title: "Action & Adventure", items: dedupe([...byGenre("Action"), ...byGenre("Adventure")]) },
    { title: "Fantasy Worlds", items: byGenre("Fantasy") },
    { title: "Sci-Fi & Cyberpunk", items: dedupe([...byGenre("Sci-Fi"), ...byGenre("Cyberpunk")]) },
  ].filter((row) => row.items.length > 0);
}

function dedupe(items: Title[]): Title[] {
  const seen = new Set<string>();
  return items.filter((t) => (seen.has(t.slug) ? false : (seen.add(t.slug), true)));
}

export type Watchable = {
  title: Title;
  episode?: Episode;
  video: string;
  heading: string;
  subheading: string;
  backTo: string;
};

/** Resolve a /watch/[id] param to a playable source (movie slug or episode id). */
export function getWatchable(id: string): Watchable | undefined {
  const movie = CATALOG.find((t) => t.type === "movie" && t.slug === id);
  if (movie?.video) {
    return {
      title: movie,
      video: movie.video,
      heading: movie.name,
      subheading: `${movie.year} · ${movie.rating} · ${movie.duration ?? ""}`.trim(),
      backTo: `/title/${movie.slug}`,
    };
  }
  for (const t of CATALOG) {
    const ep = t.episodes?.find((e) => e.id === id);
    if (ep) {
      return {
        title: t,
        episode: ep,
        video: ep.video,
        heading: `${t.name}`,
        subheading: `Episode ${ep.number} · ${ep.title} · ${ep.duration}`,
        backTo: `/title/${t.slug}`,
      };
    }
  }
  return undefined;
}

export function searchCatalog(query: string): Title[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CATALOG.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.genres.some((g) => g.toLowerCase().includes(q))
  );
}
