'use client';

import Image from 'next/image';

interface ProductProps {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

export default function Product({ name, description, price, imageUrl }: ProductProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden">
      {/* Product Image */}
      <div className="relative h-64">
        <Image
          src={imageUrl}
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
            AI Verified
          </div>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-3">
          {name}
        </h2>
        
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ${price}
            </span>
            <span className="text-sm text-gray-400">USD</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
} 