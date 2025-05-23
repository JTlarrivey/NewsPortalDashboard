import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, Newspaper } from "lucide-react";

function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg h-full transform
        transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:shadow-none
        flex flex-col
      `}
    >
      <div className="p-6 flex items-center gap-3 border-b border-gray-200">
        <Newspaper className="h-8 w-8 text-blue-600" />
        <h1 className="text-xl font-bold">Prisma Noticias</h1>
        {/* Botón cerrar en móvil */}
        <button
          className="md:hidden ml-auto text-gray-500 hover:text-gray-900"
          onClick={onClose}
          aria-label="Cerrar sidebar"
        >
          ✕
        </button>
      </div>

      <nav className="mt-6 flex flex-col">
        <NavLink
          to="/"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-4 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
              isActive ? "bg-blue-50 text-blue-600" : ""
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Panel Principal</span>
        </NavLink>
        <NavLink
          to="/articles"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-4 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
              isActive ? "bg-blue-50 text-blue-600" : ""
            }`
          }
        >
          <FileText className="h-5 w-5" />
          <span>Gestor de Artículos</span>
        </NavLink>
        <NavLink
          to="/content"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-4 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
              isActive ? "bg-blue-50 text-blue-600" : ""
            }`
          }
        >
          <Settings className="h-5 w-5" />
          <span>Control de Contenido</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
