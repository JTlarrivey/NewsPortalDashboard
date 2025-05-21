import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createArticle, updateArticle } from "../lib/api";
import type { Article } from "../types";
import { AlertCircle, Loader2 } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { supabase } from "../lib/supabase";

interface ArticleFormProps {
  article?: Article;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  "Tecnología",
  "Política",
  "Negocios",
  "Entretenimiento",
  "Deportes",
  "Ciencia",
  "Salud",
];

export function ArticleForm({
  article,
  onSuccess,
  onCancel,
}: ArticleFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Article>>(
    article || {
      title: "",
      excerpt: "",
      content: "",
      image_url: "",
      category: "",
      read_time: "",
      video_url: "",
      author_name: "",
    }
  );

  const mutation = useMutation({
    mutationFn: (data: Partial<Article>) => {
      return article?.id
        ? updateArticle(article.id, data)
        : createArticle(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      onSuccess?.();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("articles-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      setError("Error subiendo la imagen: " + error.message);
      setUploading(false);
      return;
    }

    const publicUrl = supabase.storage
      .from("articles-images")
      .getPublicUrl(data.path).data.publicUrl;

    setFormData((prev) => ({
      ...prev,
      image_url: publicUrl,
    }));

    setUploading(false);
  };

  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY;
  if (!apiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2 text-yellow-600">
        <AlertCircle className="h-5 w-5" />
        <p>
          TinyMCE API key is not configured. Please check your environment
          variables.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Extracto
        </label>
        <textarea
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contenido
        </label>
        <Editor
          apiKey={apiKey}
          value={formData.content}
          onEditorChange={handleEditorChange}
          init={{
            height: 300,
            menubar: false,
            plugins: [
              "advlist",
              "autolink",
              "lists",
              "link",
              "image",
              "charmap",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "code",
              "fullscreen",
              "insertdatetime",
              "media",
              "table",
              "code",
              "help",
              "wordcount",
            ],
            toolbar:
              "undo redo | formatselect | bold italic backcolor | \
               alignleft aligncenter alignright alignjustify | \
               bullist numlist outdent indent | removeformat | help",
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Categoría
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Seleccionar categoría</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tiempo de lectura (minutos)
        </label>
        <input
          type="number"
          name="read_time"
          value={formData.read_time}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Video URL (opcional)
        </label>
        <input
          type="url"
          name="video_url"
          value={formData.video_url}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Autor</label>
        <input
          type="text"
          name="author_name"
          value={formData.author_name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Imagen de portada
        </label>

        <div className="flex items-center space-x-2 mt-1">
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="O pega una URL de imagen"
            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </div>

        {uploading && (
          <div className="text-sm text-blue-500 mt-1 flex items-center gap-1">
            <Loader2 className="w-4 h-4 animate-spin" />
            Subiendo imagen...
          </div>
        )}

        {formData.image_url && (
          <div className="mt-2">
            <img
              src={formData.image_url}
              alt="Previsualización"
              className="h-32 object-cover rounded-md"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Artículo"
          )}
        </button>
      </div>
    </form>
  );
}
