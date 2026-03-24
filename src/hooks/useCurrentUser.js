import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

let cachedUser = null;

export function useCurrentUser() {
  const [user, setUser] = useState(cachedUser);

  useEffect(() => {
    if (cachedUser) return;
    base44.auth.me().then(u => {
      cachedUser = u;
      setUser(u);
    }).catch(() => {});
  }, []);

  return user;
}

// Returns a localStorage key scoped to the current user
export function userKey(user, key) {
  if (!user?.email) return key;
  return `${user.email}__${key}`;
}