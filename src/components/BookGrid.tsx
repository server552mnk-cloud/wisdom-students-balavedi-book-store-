import { Book } from "@/data/books";
import BookCard from "./BookCard";

interface BookGridProps {
  initialBooks: Book[];
}

export default function BookGrid({ initialBooks }: BookGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {initialBooks.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
