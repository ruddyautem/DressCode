import { clerkMiddleware } from "@clerk/nextjs/server";

import { NextRequest, NextFetchEvent } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const middleware = clerkMiddleware({ clockSkewInMs: 5 * 60 * 1000 } as any);

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return middleware(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};