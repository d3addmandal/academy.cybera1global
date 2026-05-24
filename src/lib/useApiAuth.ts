"use client";
import { useRouter, useParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Wrapper around fetch that redirects to the login page on 401.
 * Use this instead of plain fetch() in every admin editor page.
 */
export function useAuthFetch() {
  const router = useRouter();
  const params = useParams();

  return useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      const res = await fetch(url, { credentials: "same-origin", ...init });
      if (res.status === 401) {
        const company = params.company as string;
        const adminSlug = params.adminSlug as string;
        router.replace(`/webapplication/${company}/${adminSlug}/login`);
      }
      return res;
    },
    [router, params]
  );
}
