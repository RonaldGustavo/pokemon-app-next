
"use client";
import React, { useState } from 'react';
import Image from 'next/image';

import PokemonCard from '../components/PokemonCard';
import PokemonDetail from '../components/PokemonDetail';

interface Pokemon {
  name: string;
  image: string;
  types: string[];
}

interface PokedexProps {
  pokemons: Pokemon[];
}

const Pokedex: React.FC<PokedexProps> = ({ pokemons }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Pokemon | null>(null);

  const filtered = pokemons.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto bg-transparent">
      <h1 className="text-5xl font-extrabold mb-4 text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl tracking-tight animate-pulse-slow flex items-center justify-center gap-3">
        <span className="inline-block align-middle">
          <Image src="/pokeball.svg" alt="Pokeball Logo" width={48} height={48} className="w-12 h-12 drop-shadow-lg" priority />
        </span>
        <span className="inline-block align-middle">POKÉDEX</span>
      </h1>
      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
        }
      `}</style>
      <p className="text-center text-gray-500 mb-6">Cari dan temukan Pokémon favoritmu!</p>
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search Pokémon..."
          className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 min-h-[120px]">
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Image src="/pokeball.svg" alt="No Data" width={64} height={64} className="mb-4 opacity-60 animate-pulse" />
            <span className="text-gray-400 text-lg font-semibold">No Pokémon found.</span>
          </div>
        ) : (
          filtered.map((pokemon) => (
            <button
              key={pokemon.name}
              className="focus:outline-none"
              onClick={() => setSelected(pokemon)}
            >
              <PokemonCard {...pokemon} />
            </button>
          ))
        )}
      </div>
      {selected && (
        <PokemonDetail
          name={selected.name}
          image={selected.image}
          types={selected.types}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default Pokedex;
