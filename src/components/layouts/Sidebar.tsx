import { useApp } from "../../contexts/AppContext";
import { ROUTES } from "../../lib/constants";
import type { PageRoute } from "../../types";

export function Sidebar() {
  const { currentPage, navigate } = useApp();

  const navItems = Object.values(ROUTES);

  return (
    <nav
      className="hidden md:block fixed left-0 top-[60px] bottom-0 w-64 border-r border-border bg-card p-4"
      aria-label="Main navigation"
    >
      <div className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id as PageRoute)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${
              currentPage === item.id
                ? "bg-primary text-white shadow-sm"
                : "hover:bg-accent text-foreground hover:text-foreground"
            }`}
            aria-current={currentPage === item.id ? "page" : undefined}
          >
            <span className="text-lg" aria-hidden="true">
              {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
