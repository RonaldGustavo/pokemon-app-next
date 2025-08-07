
"use client";
import React, { useState } from 'react';
import Image from 'next/image';

import PokemonCard from '../components/PokemonCard';
import PokemonDetail from '../components/PokemonDetail';
import { getPokemons } from '@/services/pokemon.service';

interface Pokemon {
  name: string;
  image: string;
  types: string[];
}

const Pokedex: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allNames, setAllNames] = useState<string[]>([]);

  React.useEffect(() => {
    async function fetchNames() {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
        const data = await res.json();
        setAllNames(data.results.map((p: { name: string }) => p.name));
      } catch {}
    }
    fetchNames();
  }, []);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        if (debouncedSearch) {
          const allMatched = allNames.filter((n) => n.toLowerCase().includes(debouncedSearch.toLowerCase()));
          if (isMounted) setMatched(allMatched);
          const pageMatched = allMatched.slice((page - 1) * pageSize, page * pageSize);
          const results: Pokemon[] = await Promise.all(
            pageMatched.map(async (name) => {
              const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
              const pokeData = await res.json();
              return {
                name: pokeData.name,
                image: pokeData.sprites.other['official-artwork'].front_default,
                types: pokeData.types.map((t: { type: { name: string } }) => t.type.name),
              };
            })
          );
          if (isMounted) setPokemons(results);
        } else {
          if (isMounted) setMatched([]);
          const offset = (page - 1) * pageSize;
          const data = await getPokemons(pageSize, offset);
          if (isMounted) setPokemons(data);
        }
      } catch {
        if (isMounted) setError('Failed to load Pokémon data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [page, debouncedSearch, allNames]);

  React.useEffect(() => { setPage(1); }, [search]);

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
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Image src="/pokeball.svg" alt="Loading" width={64} height={64} className="mb-4 animate-spin-slow opacity-60" />
            <span className="text-gray-400 text-lg font-semibold">Loading Pokémon...</span>
          </div>
        ) : error ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <span className="text-red-400 text-lg font-semibold">{error}</span>
          </div>
        ) : pokemons.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Image src="/pokeball.svg" alt="No Data" width={64} height={64} className="mb-4 opacity-60 animate-pulse" />
            <span className="text-gray-400 text-lg font-semibold">No Pokémon found.</span>
          </div>
        ) : (
          pokemons.map((pokemon) => (
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
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          className={`px-4 py-2 rounded-lg font-semibold border transition-all shadow ${page === 1 ? 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'}`}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="text-base font-bold text-blue-400 bg-gray-900/60 px-4 py-2 rounded-lg border border-gray-700 shadow">
          Page {page}
        </span>
        <button
          className={`px-4 py-2 rounded-lg font-semibold border transition-all shadow ${
            (search
              ? page * pageSize >= matched.length || pokemons.length === 0
              : pokemons.length < pageSize || pokemons.length === 0)
              ? 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
          }`}
          onClick={() => setPage((p) => p + 1)}
          disabled={
            search
              ? page * pageSize >= matched.length || pokemons.length === 0
              : pokemons.length < pageSize || pokemons.length === 0
          }
        >
          Next
        </button>
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
