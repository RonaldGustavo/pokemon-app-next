
"use client";
import TYPE_COLORS from '@/constants/type_colors';
import React from 'react';


import type { Pokemon } from '@/services/pokemon.service';
import Image from 'next/image';

const PokemonCard: React.FC<Pokemon> = ({ name, image, types }) => {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 p-4 flex flex-col items-center border border-gray-700 hover:border-blue-500 hover:shadow-blue-500/30">
      <Image
        src={image}
        alt={name}
        width={96}
        height={96}
        className="w-24 h-24 object-contain drop-shadow-lg mb-2"
        loading="lazy"
      />
      <h2 className="text-lg font-bold capitalize mb-1 text-gray-100">{name}</h2>
      <div className="flex gap-2">
        {types.map((type: string) => (
          <span
            key={type}
            className={`px-2 py-1 rounded-full text-xs font-semibold border ${TYPE_COLORS[type] || 'bg-blue-900/30 text-blue-200 border-blue-700'}`}
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PokemonCard;
