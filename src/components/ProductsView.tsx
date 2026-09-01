import { Category, Product } from "../../sanity.types";
import ProductGrid from "./ProductGrid";
import CategorySelectorComponent from "./ui/category-selector";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
}

const ProductsViews = ({ products, categories }: ProductsViewProps) => {
  return (
    <div className='flex flex-col'>
      {/* categories */}
      <div className='w-full sm:w-50'>
        <CategorySelectorComponent categories={categories} />
      </div>

      {/* products */}
      <div className='flex-1'>
        <div>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
};

export default ProductsViews;
