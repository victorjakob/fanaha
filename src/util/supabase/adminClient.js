"use client";

import { supabase as publicClient } from "./supabaseClient";

/**
 * Drop-in replacement for the browser Supabase client on admin pages.
 * `supabase.from(table)…` calls are recorded and run on the server (/api/admin/db) after checking the
 * admin session, so the browser never needs write access to the database.
 * `supabase.storage` still uses the public client (image uploads to the alchemy-images bucket).
 */
function query(table) {
  const steps = [];
  let promise = null;
  const run = () => {
    if (!promise) {
      promise = fetch("/api/admin/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, steps }),
      })
        .then(async (res) => {
          const body = await res.json().catch(() => null);
          if (!body) return { data: null, error: { message: `Request failed (${res.status})` } };
          return body;
        })
        .catch((e) => ({ data: null, error: { message: e?.message || "Network error" } }));
    }
    return promise;
  };
  const builder = new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === "then") return (resolve, reject) => run().then(resolve, reject);
        if (prop === "catch") return (reject) => run().catch(reject);
        if (prop === "finally") return (fn) => run().finally(fn);
        if (typeof prop !== "string") return undefined;
        return (...args) => {
          steps.push([prop, ...args]);
          return builder;
        };
      },
    }
  );
  return builder;
}

export const supabase = {
  from: (table) => query(table),
  storage: publicClient.storage,
};
