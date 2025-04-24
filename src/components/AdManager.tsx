import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  position: "side" | "bottom" | "popup";
  active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface AdFormData {
  title: string;
  image_url: string;
  link_url: string;
  position: "side" | "bottom" | "popup";
  active: boolean;
  start_date: string;
  end_date: string;
}

const initialFormData: AdFormData = {
  title: "",
  image_url: "",
  link_url: "",
  position: "side",
  active: true,
  start_date: new Date().toISOString().split("T")[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
};

const positionLabels = {
  side: "Lateral",
  bottom: "Inferior",
  popup: "Emergente",
};

export function AdManager() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState<AdFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);

  const { data: ads, isLoading } = useQuery({
    queryKey: ["ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Ad[];
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AdFormData & { id?: string }) => {
      const { id, ...adData } = data;
      if (id) {
        const { error } = await supabase
          .from("ads")
          .update(adData)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ads").insert([adData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      setIsModalOpen(false);
      setSelectedAd(null);
      setFormData(initialFormData);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(selectedAd ? { ...formData, id: selectedAd.id } : formData);
  };

  const handleEdit = (ad: Ad) => {
    setSelectedAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url,
      position: ad.position,
      active: ad.active,
      start_date: ad.start_date.split("T")[0],
      end_date: ad.end_date.split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este anuncio?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de Anuncios</h2>
        <button
          onClick={() => {
            setSelectedAd(null);
            setFormData(initialFormData);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" />
          Nuevo Anuncio
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anuncio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ads?.map((ad) => (
                <tr key={ad.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {ad.image_url ? (
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ad.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {ad.link_url}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {positionLabels[ad.position]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ad.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ad.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(ad.start_date), "dd/MM/yyyy")} -{" "}
                    {format(new Date(ad.end_date), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(ad)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedAd ? "Editar Anuncio" : "Nuevo Anuncio"}
            </h3>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="image_url"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL de la Imagen
                </label>
                <input
                  type="url"
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="link_url"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL de Destino
                </label>
                <input
                  type="url"
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) =>
                    setFormData({ ...formData, link_url: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700"
                >
                  Posición
                </label>
                <select
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      position: e.target.value as "side" | "bottom" | "popup",
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="side">Lateral</option>
                  <option value="bottom">Inferior</option>
                  <option value="popup">Emergente</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium text-gray-700"
                >
                  Activo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
