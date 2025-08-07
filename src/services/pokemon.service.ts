export interface Pokemon {
  name: string;
  image: string;
  types: string[];
}

export interface Ability {
  ability: { name: string; url: string };
}

export interface Move {
  move: { name: string; url: string };
}

export interface PokemonDetail {
  id: number;
  name: string;
  image: string;
  types: string[];
  abilities: Ability[];
  weight: number;
  base_experience: number;
  stats: { name: string; value: number }[];
  moves: Move[];
  species: { name: string; url: string };
}

const BASE_URL = 'https://pokeapi.co'

export async function getAllPokemonNames(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/api/v2/pokemon?limit=2000`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.map((p: { name: string }) => p.name);
}

export async function getPokemons(limit = 10, offset = 0, search = ''): Promise<Pokemon[]> {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  const data = await res.json();
  let results = data.results;
  if (search) {
    results = results.filter((p: { name: string }) => p.name.toLowerCase().includes(search.toLowerCase()));
  }
  const pokemons = await Promise.all(
    results.map(async (pokemon: { name: string; url: string }) => {
      const pokeRes = await fetch(pokemon.url);
      const pokeData = await pokeRes.json();
      return {
        name: pokeData.name,
        image: pokeData.sprites.other['official-artwork'].front_default,
        types: pokeData.types.map((t: { type: { name: string } }) => t.type.name),
      };
    })
  );
  return pokemons;
}

export async function getPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
  const res = await fetch(`${BASE_URL}/api/v2/pokemon/${nameOrId}`);
  if (!res.ok) throw new Error('Pokémon not found');
  const pokeData = await res.json();
  return {
    id: pokeData.id,
    name: pokeData.name,
    image: pokeData.sprites.other['official-artwork'].front_default,
    types: pokeData.types.map((t: { type: { name: string } }) => t.type.name),
    abilities: pokeData.abilities, 
    weight: pokeData.weight,
    base_experience: pokeData.base_experience,
    stats: pokeData.stats.map((s: { stat: { name: string }, base_stat: number }) => ({ name: s.stat.name, value: s.base_stat })),
    moves: pokeData.moves,
    species: pokeData.species,
  };
}

export async function getPokemonOfficialArtwork(name: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/v2/pokemon/${name}`);
  if (!res.ok) return '';
  const pokeData = await res.json();
  return pokeData.sprites.other['official-artwork'].front_default || '';
}