export const COUPON_CODES = {
  HIVER: "HIVER",
  BFRIDAY: "BFRIDAY",
  XMAS2021: "XMAS2021",
  NY2022: "NY2022",
  ETE: "ETE2025",
} as const;



export type CouponCode = typeof COUPON_CODES[keyof typeof COUPON_CODES];
