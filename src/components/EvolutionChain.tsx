import React from 'react';
import Image from 'next/image';

interface EvolutionChainProps {
  evolution: { name: string; image: string }[];
  currentName: string;
}

const EvolutionChain: React.FC<EvolutionChainProps> = ({ evolution, currentName }) => {
  if (!evolution || evolution.length === 0) return null;
  return (
    <div className="flex flex-col items-center justify-center mt-2">
      {evolution.map((evo, idx) => (
        <React.Fragment key={evo.name}>
          <div className={`flex flex-col items-center ${evo.name === currentName ? 'scale-110' : ''}`}>
            <Image
              src={evo.image}
              alt={evo.name}
              width={64}
              height={64}
              className="rounded-full bg-gray-700 border-2 border-blue-400 shadow-lg"
            />
            <span className="mt-1 text-xs font-bold capitalize text-gray-100">{evo.name}</span>
          </div>
          {idx < evolution.length - 1 && (
            <span className="text-2xl text-blue-400 font-bold my-0.5 mb-2">↓</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default EvolutionChain;
