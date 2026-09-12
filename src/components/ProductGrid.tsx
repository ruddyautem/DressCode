"use client";
import { Product } from "../../sanity.types";
import { AnimatePresence, motion } from "framer-motion";
import ProductThumb from "./ProductThumb";

const ProductGrid = ({ products }: { products: Product[] }) => {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 items-stretch'>
      {products?.filter(Boolean).map((product, index) => {
        return (
          <AnimatePresence key={product._id}>
            <motion.div
              className='flex flex-col h-full'
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <ProductThumb
                key={product._id}
                product={product}
                priority={index < 4}
              />
            </motion.div>
          </AnimatePresence>
        );
      })}
    </div>
  );
};

export default ProductGrid;


