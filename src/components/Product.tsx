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
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-md mx-auto">
      <div className="relative h-64">
        <Image
          src={imageUrl}
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
          className="w-full h-full"
        />
      </div>
      
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {name}
        </h1>
        
        <p className="text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-blue-600">
            ${price}
          </span>
          <span className="text-sm text-gray-500">
            USD
          </span>
        </div>
      </div>
    </div>
  );
} 