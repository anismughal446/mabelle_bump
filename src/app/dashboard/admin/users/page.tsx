"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/Skeleton";

type User = { id: number; name: string; email: string; role: string; createdAt: string };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;

  const roleColor = (r: string) =>
    r === "admin" ? "bg-plum text-white" : r === "vendor" ? "bg-sage text-white" : "bg-blush text-plum";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-plum">Users</h1>
      <p className="mt-1 text-ink/60">{users.length} accounts</p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-blush bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-blush text-left text-ink/50">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-blush/50 last:border-0">
                <td className="p-4 font-medium text-ink">{u.name}</td>
                <td className="p-4 text-ink/70">{u.email}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${roleColor(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-ink/50">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
