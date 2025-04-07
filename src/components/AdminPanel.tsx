import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, AlertCircle, Shield, ShieldOff } from "lucide-react";
import { searchUsers, toggleAdminStatus } from "../lib/api";

export function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", searchTerm],
    queryFn: () => searchUsers(searchTerm),
    enabled: searchTerm.length > 2,
  });

  const toggleAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      toggleAdminStatus(userId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Gestión de Administradores</h2>

      <div className="relative mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar usuarios por email..."
          className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p>Error al buscar usuarios</p>
        </div>
      )}

      {isLoading && searchTerm.length > 2 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      )}

      {users && users.length > 0 && (
        <div className="divide-y">
          {users.map((user) => (
            <div
              key={user.id}
              className="py-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-gray-500">
                  {user.is_admin ? "Administrador" : "Usuario"}
                </p>
              </div>
              <button
                onClick={() =>
                  toggleAdminMutation.mutate({
                    userId: user.id,
                    isAdmin: !user.is_admin,
                  })
                }
                disabled={toggleAdminMutation.isPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  user.is_admin
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {user.is_admin ? (
                  <>
                    <ShieldOff className="h-4 w-4" />
                    Quitar admin
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Hacer admin
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {searchTerm.length > 2 && users?.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No se encontraron usuarios
        </p>
      )}
    </div>
  );
}
