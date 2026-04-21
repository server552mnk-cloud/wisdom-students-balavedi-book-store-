"use client";

import { useState } from "react";
import { Book } from "@/data/books";
import CheckoutModal from "./CheckoutModal";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
        <div className="aspect-[3/4] w-full overflow-hidden relative bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-sm">
            ₹{book.price}
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-2">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{book.title}</h3>
            <p className="text-gray-500 text-sm">{book.author}</p>
          </div>
          <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-grow">
            {book.description}
          </p>
          
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full py-2.5 px-4 bg-gray-900 hover:bg-sky-600 text-white font-medium rounded-xl transition-colors duration-300 shadow-sm"
          >
            Buy Now
          </button>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal book={book} onClose={() => setShowCheckout(false)} />
      )}
    </>
  );
}
