import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, Newspaper } from "lucide-react";

function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold">Prisma Noticias</h1>
        </div>
      </div>
      <nav className="mt-6">
        <NavLink
          to="/"
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
