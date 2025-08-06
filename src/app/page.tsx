
import React from 'react';
import Pokedex from '../components/Pokedex';
import { getPokemons } from '../services/pokemon.service';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const pokemons = await getPokemons();
  return <Pokedex pokemons={pokemons} />;
}
