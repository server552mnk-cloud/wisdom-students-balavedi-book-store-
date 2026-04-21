import BookGrid from "@/components/BookGrid";
import { books as mockBooks, Book } from "@/data/books";
import Image from "next/image";

export const dynamic = 'force-dynamic';

async function getProducts(): Promise<Book[]> {
  try {
    const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (!url || url.includes('your_script_id')) return mockBooks;

    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return mockBooks;
    
    // Google Apps Script often returns JSON with text/html headers if MimeType isn't set perfectly.
    // Try to parse it regardless of the header.
    let data;
    try {
      const text = await res.text();
      data = JSON.parse(text);
    } catch (parseError) {
      console.warn("Webhook did not return valid JSON. Falling back to mock books.");
      return mockBooks;
    }
    
    // Helper to convert Google Drive viewer links to direct image links
    const getDirectImageUrl = (url: string) => {
      if (!url) return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop";
      
      const gDriveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
      if (gDriveMatch && gDriveMatch[1]) {
        // The lh3.googleusercontent.com endpoint is much more reliable for <img> tags
        return `https://lh3.googleusercontent.com/d/${gDriveMatch[1]}`;
      }
      return url;
    };
    
    // The user's script is returning a raw array of objects
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item, index) => ({
        id: `g_${index}`,
        title: item["Book Title"] || item.title || "Unknown Title",
        author: "Summer Quest", // default
        price: Number(item["Price"] || item.price) || 0,
        description: item["Description"] || item.description || "",
        image: getDirectImageUrl(item["Image URL"] || item.image)
      }));
    }
    
    // Fallback if the script returned { products: [...] }
    if (data && Array.isArray(data.products) && data.products.length > 0) {
      return data.products;
    }
    
    return mockBooks;
  } catch (error) {
    // Fail silently in development so the Next.js error overlay doesn't block the UI
    console.warn("Failed to fetch products from webhook, falling back to mock data.");
    return mockBooks;
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="flex-1 flex flex-col">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* The user needs to place the uploaded image in the public folder as logo.png */}
            <div className="relative h-20 w-auto flex items-center justify-center">
              <img src="/logo.png" alt="Summer Quest Logo" className="h-full w-auto object-contain" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Curated for Excellence
            </h2>
            <p className="text-lg text-gray-500">
              Select your required course material below. Securely checkout via Razorpay and get your order confirmation instantly.
            </p>
          </div>
        </div>

        <BookGrid initialBooks={products} />
      </div>
    </main>
  );
}
