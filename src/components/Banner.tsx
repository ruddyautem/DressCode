import { getActiveSale } from "@/sanity/lib/sales/getActiveSaleByCouponCode";
import BannerClient from "./BannerClient";

const Banner = async () => {
  const sale = await getActiveSale();

  // Explicitly check if sale exists and is active
  if (!sale || sale.isActive !== true) {
    return null;
  }

  return (
    <BannerClient
      sale={{
        title: sale.title,
        description: sale.description,
        couponCode: sale.couponCode,
        discountAmount: sale.discountAmount,
      }}
    />
  );
};

export default Banner;

