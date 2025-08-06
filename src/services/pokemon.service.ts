
const BASE_URL = 'https://pokeapi.co'

export async function getPokemonOfficialArtwork(name: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/v2/pokemon/${name}`);
  if (!res.ok) return '';
  const pokeData = await res.json();
  return pokeData.sprites.other['official-artwork'].front_default || '';
}
export async function getPokemons(limit = 100) {
  const res = await fetch(`${BASE_URL}/api/v2/pokemon?limit=${limit}`);
  const data = await res.json();
  const pokemons = await Promise.all(
    data.results.map(async (pokemon: { name: string; url: string }) => {
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

export async function getPokemonDetail(nameOrId: string | number) {
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
