export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
  description: string;
}

export const books: Book[] = [
  {
    id: "b1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 399,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    description: "A novel about the American dream and the roaring twenties.",
  },
  {
    id: "b2",
    title: "1984",
    author: "George Orwell",
    price: 450,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
    description: "A dystopian social science fiction novel and cautionary tale.",
  },
  {
    id: "b3",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 350,
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
    description: "A novel about the serious issues of rape and racial inequality.",
  },
  {
    id: "b4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: 299,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop",
    description: "A romantic novel of manners written by Jane Austen.",
  },
  {
    id: "b5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    price: 499,
    image: "https://images.unsplash.com/photo-1585779034823-7e9ac8fa3731?q=80&w=600&auto=format&fit=crop",
    description: "A novel about teenage rebellion and angst.",
  },
  {
    id: "b6",
    title: "Moby Dick",
    author: "Herman Melville",
    price: 550,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
    description: "The epic tale of a captain's obsessive quest for a white whale.",
  }
];
