import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import TYPE_COLORS from '@/constants/type_colors';
import EvolutionChain from './EvolutionChain';
import {
  getPokemonOfficialArtwork,
  getPokemonDetail,
} from '@/services/pokemon.service';

export interface PokemonDetailProps {
  name: string;
  image: string;
  types: string[];
  onClose: () => void;
}

interface DetailData {
  description: string;
  abilities: { name: string; effect: string }[];
  moves: string[];
  weight: number;
  region: string;
  evolution: { name: string; image: string }[];
  stats: { name: string; value: number }[];
}

const PokemonDetail: React.FC<PokemonDetailProps> = ({
  name,
  image,
  types,
  onClose,
}) => {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      let description = '-';
      let abilities: { name: string; effect: string }[] = [];
      let moves: string[] = [];
      let weight = 0;
      let region = '-';
      const evolution: { name: string; image: string }[] = [];
      let stats: { name: string; value: number }[] = [];
      try {
        const poke = await getPokemonDetail(name);
        weight = typeof poke.weight === 'number' ? poke.weight / 10 : 0;
        stats = Array.isArray(poke.stats) ? poke.stats : [];
        if (poke.species && poke.species.url) {
          try {
            const speciesRes = await fetch(poke.species.url);
            const species = await speciesRes.json();
            const flavor = species.flavor_text_entries?.find(
              (f: { language: { name: string }; flavor_text: string }) =>
                f.language.name === 'en'
            );
            description = flavor?.flavor_text?.replace(/\f|\n|\r/g, ' ') || '-';
            region =
              species.generation?.name
                ?.replace('generation-', '')
                .toUpperCase() || '-';
            if (species.evolution_chain?.url) {
              try {
                const evoRes = await fetch(species.evolution_chain.url);
                const evoData = await evoRes.json();
                let evo = evoData.chain;
                while (evo) {
                  let evoImg = '';
                  try {
                    evoImg = await getPokemonOfficialArtwork(evo.species.name);
                  } catch {}
                  evolution.push({ name: evo.species.name, image: evoImg });
                  evo =
                    evo.evolves_to && evo.evolves_to.length > 0
                      ? evo.evolves_to[0]
                      : null;
                }
              } catch {}
            }
          } catch {}
        }
        if (Array.isArray(poke.abilities)) {
          abilities = await Promise.all(
            poke.abilities
              .filter((a) => a.ability && a.ability.name && a.ability.url)
              .map(async (a) => {
                let effect = '';
                try {
                  const abRes = await fetch(a.ability.url);
                  if (abRes.ok) {
                    const abData = await abRes.json();
                    const eff = abData.effect_entries?.find(
                      (e: { language: { name: string } }) =>
                        e.language.name === 'en'
                    );
                    effect = eff?.short_effect || eff?.effect || '';
                  }
                } catch {}
                return { name: a.ability.name, effect };
              })
          );
        }
        if (Array.isArray(poke.moves)) {
          moves = poke.moves
            .filter((m) => m.move && m.move.name)
            .slice(0, 10)
            .map((m) => m.move.name);
        }
        if (isMounted) {
          setDetail({
            description,
            abilities,
            moves,
            weight,
            region,
            evolution,
            stats,
          });
        }
      } catch (err) {
        console.error('fetchDetail error', err);
        if (isMounted) {
          setDetail({
            description,
            abilities,
            moves,
            weight,
            region,
            evolution,
            stats,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [name]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur border-t border-b border-white/20"
        style={{ zIndex: 0 }}
      />
      <div
        className="relative bg-gray-800 rounded-2xl shadow-xl transform transition-transform duration-300 p-8 max-w-2xl w-full flex flex-row items-stretch animate-fadeInUp border border-gray-700 hover:border-blue-500 hover:shadow-blue-500/30 pointer-events-auto"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)', zIndex: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center min-w-[160px] pr-6 border-r border-gray-700 h-full">
          <Image
            src={image}
            alt={name}
            width={144}
            height={144}
            className="w-36 h-36 object-contain mb-4 drop-shadow-xl"
            priority
          />
          <div className="flex gap-2 mb-2 flex-wrap justify-center">
            {types.map((type) => (
              <span
                key={type}
                className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                  TYPE_COLORS[type] ||
                  'bg-blue-900/30 text-blue-200 border-blue-700'
                }`}
              >
                {type}
              </span>
            ))}
          </div>
          {detail && (
            <div className="flex flex-col items-center justify-center mt-4 w-full">
              <span className="font-bold text-blue-300 mb-1">Evolution</span>
              <EvolutionChain evolution={detail.evolution} currentName={name} />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center pl-6">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-2xl font-bold focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-3xl font-extrabold capitalize mb-3 text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl tracking-tight animate-pulse-slow">
            {name}
          </h2>
          <style jsx>{`
            .animate-pulse-slow {
              animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes pulse {
              0%,
              100% {
                filter: brightness(1);
              }
              50% {
                filter: brightness(1.15);
              }
            }
            @keyframes spin {
              100% {
                transform: rotate(360deg);
              }
            }
            .animate-spin-slow {
              animation: spin 1.2s linear infinite;
            }
          `}</style>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <img
                src="/pokeball.svg"
                alt="Loading Pokeball"
                className="w-16 h-16 animate-spin-slow mb-2"
              />
              <span className="text-gray-400 text-center text-base font-semibold">
                Loading...
              </span>
            </div>
          ) : detail ? (
            <div className="w-full text-base text-gray-100 space-y-3">
              <div>
                <span className="font-bold text-blue-300 block mb-1">
                  Description
                </span>
                <div className="bg-gray-900/60 rounded-lg px-4 py-2 text-gray-100 text-sm shadow-inner border border-gray-700">
                  {detail.description}
                </div>
              </div>
              <span className="font-bold text-blue-300 block mb-1">Weight</span>
              <div className="bg-gray-900/60 rounded-lg px-4 py-2 text-gray-100 text-sm shadow-inner border border-gray-700">
                {detail.weight}
              </div>
              <div>
                <span className="font-bold text-blue-300">Abilities</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detail.abilities.map((ab) => (
                    <div
                      key={ab.name}
                      className="px-3 py-1 rounded-full bg-purple-900/40 text-purple-200 border border-purple-700 text-xs font-semibold shadow flex flex-col items-start min-w-[50px]"
                    >
                      <span className="capitalize font-bold">
                        {ab.name.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-bold text-blue-300">Moves</span>
                <span className="ml-2 text-xs text-gray-400">
                  ({detail.moves.length} moves shown)
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detail.moves.map((move) => (
                    <span
                      key={move}
                      className="px-3 py-1 rounded-full bg-blue-900/40 text-blue-200 border border-blue-700 text-xs font-semibold shadow"
                    >
                      {move.replace('-', ' ')}
                    </span>
                  ))}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  * Showing up to 10 moves. See more in Pokédex database.
                </div>
              </div>
              <div>
                <span className="font-bold text-blue-300">Stats:</span>
                <div className="mt-2 space-y-1">
                  {detail.stats.slice(0, 3).map((stat) => (
                    <div
                      key={stat.name}
                      className="flex items-center gap-2 mt-2"
                    >
                      <span className="w-16 text-xs capitalize text-gray-300 font-semibold">
                        {stat.name}
                      </span>
                      <div className="flex-1 bg-gray-700 rounded h-3 overflow-hidden">
                        <div
                          className="h-3 rounded bg-gradient-to-r from-blue-400 to-blue-600"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((stat.value / 180) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-400 text-center py-8">
              Failed to load details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;
