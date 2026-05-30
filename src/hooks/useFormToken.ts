"use client";
import { useEffect, useRef, useState } from "react";

export function useFormToken() {
  const [token, setToken] = useState("");
  const renderedAt = useRef(Date.now());

  useEffect(() => {
    fetch("/api/contact/token")
      .then((r) => r.json())
      .then((d: { token?: string }) => { if (d.token) setToken(d.token); })
      .catch(() => {});
  }, []);

  return { token, renderedAt: renderedAt.current };
}
