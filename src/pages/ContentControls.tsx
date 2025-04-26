import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import {
  fetchTickerItems,
  fetchCarouselItems,
  updateTickerItems,
  updateCarouselItems,
  fetchArticles,
} from "../lib/api";
import type { TickerItem, CarouselItem, Article } from "../types";

function ContentControls() {
  const queryClient = useQueryClient();
  const [tickerItems, setTickerItems] = useState<Partial<TickerItem>[]>([]);
  const [carouselItems, setCarouselItems] = useState<Partial<CarouselItem>[]>(
    []
  );

  const {
    data: existingTickerItems,
    isLoading: isLoadingTicker,
    error: tickerError,
  } = useQuery({
    queryKey: ["ticker"],
    queryFn: fetchTickerItems,
  });

  useEffect(() => {
    if (existingTickerItems && tickerItems.length === 0) {
      setTickerItems(existingTickerItems);
    }
  }, [existingTickerItems, tickerItems.length]);

  const {
    data: existingCarouselItems,
    isLoading: isLoadingCarousel,
    error: carouselError,
  } = useQuery({
    queryKey: ["carousel"],
    queryFn: fetchCarouselItems,
  });

  useEffect(() => {
    if (existingCarouselItems && carouselItems.length === 0) {
      setCarouselItems(existingCarouselItems);
    }
  }, [existingCarouselItems, carouselItems.length]);

  const { data: articles } = useQuery({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });

  const tickerMutation = useMutation({
    mutationFn: updateTickerItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticker"] });
    },
  });

  const carouselMutation = useMutation({
    mutationFn: updateCarouselItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousel"] });
    },
  });

  if (isLoadingTicker || isLoadingCarousel) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p>Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (tickerError || carouselError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="h-6 w-6" />
          <p>Error al cargar contenido</p>
        </div>
      </div>
    );
  }

  const addTickerItem = () => {
    setTickerItems([
      ...tickerItems,
      {
        text: "",
        link: "",
        active: true,
        order: tickerItems.length,
      },
    ]);
  };

  const removeTickerItem = (index: number) => {
    const newItems = [...tickerItems];
    newItems.splice(index, 1);
    newItems.forEach((item, i) => {
      item.order = i;
    });
    setTickerItems(newItems);
  };

  const moveTickerItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === tickerItems.length - 1)
    ) {
      return;
    }

    const newItems = [...tickerItems];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];
    newItems.forEach((item, i) => {
      item.order = i;
    });
    setTickerItems(newItems);
  };

  const addCarouselItem = () => {
    setCarouselItems([
      ...carouselItems,
      {
        article_id: "",
        active: true,
        order: carouselItems.length,
      },
    ]);
  };

  const removeCarouselItem = (index: number) => {
    const newItems = [...carouselItems];
    newItems.splice(index, 1);
    newItems.forEach((item, i) => {
      item.order = i;
    });
    setCarouselItems(newItems);
  };

  const moveCarouselItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === carouselItems.length - 1)
    ) {
      return;
    }

    const newItems = [...carouselItems];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];
    newItems.forEach((item, i) => {
      item.order = i;
    });
    setCarouselItems(newItems);
  };

  const handleTickerSave = async () => {
    try {
      const cleanTickerItems = tickerItems.map(
        ({ id, created_at, ...rest }) => ({
          ...rest,
          active: true,
        })
      );
      await tickerMutation.mutateAsync(
        cleanTickerItems as Omit<TickerItem, "id">[]
      );
    } catch (error) {
      console.error("Failed to update ticker items:", error);
    }
  };

  const handleCarouselSave = async () => {
    try {
      const cleanCarouselItems = carouselItems.map(
        ({ id, created_at, ...rest }) => ({
          ...rest,
          active: true,
        })
      );
      await carouselMutation.mutateAsync(
        cleanCarouselItems as Omit<CarouselItem, "id">[]
      );
    } catch (error) {
      console.error("Failed to update carousel items:", error);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Control de Contenido</h1>

      {/* News Ticker Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Corredor de Noticias</h2>
          <div className="flex gap-2">
            <button
              onClick={addTickerItem}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Agregar Item
            </button>
            <button
              onClick={handleTickerSave}
              disabled={tickerMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              {tickerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tickerItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => moveTickerItem(index, "up")}
                  disabled={index === 0}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveTickerItem(index, "down")}
                  disabled={index === tickerItems.length - 1}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={item.text || ""}
                onChange={(e) => {
                  const newItems = [...tickerItems];
                  newItems[index].text = e.target.value;
                  setTickerItems(newItems);
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Texto de la noticia"
              />
              <input
                type="url"
                value={item.link || ""}
                onChange={(e) => {
                  const newItems = [...tickerItems];
                  newItems[index].link = e.target.value;
                  setTickerItems(newItems);
                }}
                className="w-64 px-3 py-2 border rounded-lg"
                placeholder="URL del link"
              />
              <button
                onClick={() => removeTickerItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Carrusel de destacadas</h2>
          <div className="flex gap-2">
            <button
              onClick={addCarouselItem}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Agregar Item
            </button>
            <button
              onClick={handleCarouselSave}
              disabled={carouselMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              {carouselMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {carouselItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => moveCarouselItem(index, "up")}
                  disabled={index === 0}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveCarouselItem(index, "down")}
                  disabled={index === carouselItems.length - 1}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <select
                value={item.article_id || ""}
                onChange={(e) => {
                  const newItems = [...carouselItems];
                  newItems[index].article_id = e.target.value;
                  setCarouselItems(newItems);
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
              >
                <option value="">Seleccionar Artículo</option>
                {articles?.map((article: Article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeCarouselItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContentControls;
