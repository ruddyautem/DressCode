import Link from "next/link";
import { Product } from "../../sanity.types";
import Image from "next/image";
import { urlForThumb } from "@/lib/imageUrl";

interface ProductThumbProps {
  product: Product;
  priority?: boolean; // ✅ NEW: Allow priority flag
}

const ProductThumb = ({ product, priority = false }: ProductThumbProps) => {
  const isOutOfStock = product.stock != null && product.stock <= 0;

  return (
    <Link
      href={`/product/${product.slug?.current}`}
      className={`group flex flex-col bg-white rounded-lg w-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isOutOfStock ? "opacity-50" : ""}`}
    >
      <div className='relative aspect-square w-full overflow-hidden bg-gray-100'>
        {product.image && (
          <Image
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            src={urlForThumb(product.image, 600) || ""}
            alt={product.name || "Product Image"}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
            loading={priority ? 'eager' : 'lazy'} // ✅ CHANGED: Conditional loading
            priority={priority} // ✅ NEW: Add priority for LCP images
            quality={80}
            suppressHydrationWarning
          />
        )}
        {isOutOfStock && (
          <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <span className='text-white font-bold text-lg'>
              Rupture de Stock
            </span>
          </div>
        )}
      </div>
      <div className='p-4'>
        <h2 className='text-lg font-semibold text-gray-800 truncate'>
          {product.name}
        </h2>
        <p className='mt-2 text-sm text-gray-600 line-clamp-2'>
          {product.description
            ?.map((block) =>
              block._type === "block"
                ? block.children?.map((child) => child.text).join("")
                : ""
            )
            .join("") || "no description available"}
        </p>
        <p className='mt-2 text-lg font-bold text-gray-900'>
          €{product.price?.toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default ProductThumb;