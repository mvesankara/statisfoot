import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const [users, reports, players] = await Promise.all([
    prisma.user.count(),
    prisma.report.count(),
    prisma.player.count(),
  ]);

  return (
    <div className="p-8 grid grid-cols-3 gap-4">
      <div className="card">Users: {users}</div>
      <div className="card">Reports: {reports}</div>
      <div className="card">Players: {players}</div>
    </div>
  );
}
