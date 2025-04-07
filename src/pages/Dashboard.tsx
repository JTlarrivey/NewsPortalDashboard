import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, FileText, TrendingUp, AlertCircle, Eye } from "lucide-react";
import { fetchStats } from "../lib/api";
import { AdminPanel } from "../components/AdminPanel";
import { useAuth } from "../lib/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="h-6 w-6" />
          <p>Error al cargar los datos del panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <FileText className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total de Artículos</p>
              <p className="text-2xl font-bold">{stats?.totalArticles || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Users className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total de Autores</p>
              <p className="text-2xl font-bold">{stats?.totalAuthors || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-10 w-10 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Elementos Activos</p>
              <p className="text-2xl font-bold">
                {(stats?.activeTickerItems || 0) +
                  (stats?.activeCarouselItems || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Eye className="h-10 w-10 text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">Total de Vistas</p>
              <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Artículos Más Vistos</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.visitedNews}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="title"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#3b82f6" name="Vistas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Admin Panel - Only shown to admin users */}
      {user?.is_admin && <AdminPanel />}
    </div>
  );
}

export default Dashboard;
