"use client";

import { useAuth } from "@/context/AuthContext";

export default function TestContextPage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
  } = useAuth();

  if (isLoading) {
    return (
      <main className="p-10">
        <p>Checking authentication...</p>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-10">
      <h1 className="text-3xl font-bold">
        Auth Context Test
      </h1>

      <div>
        <p>
          Authenticated:{" "}
          {isAuthenticated ? "YES" : "NO"}
        </p>

        <p>
          User: {user?.name ?? "No user"}
        </p>

        <p>
          Email: {user?.email ?? "No email"}
        </p>
      </div>

      {isAuthenticated && (
        <button
          onClick={logout}
          className="rounded bg-red-600 px-5 py-2 text-white"
        >
          Logout
        </button>
      )}
    </main>
  );
}