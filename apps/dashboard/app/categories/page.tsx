"use client";

import DashboardShell from "@/components/dashboard-shell";
import SortableCategoryList from "./components/sortable-category-list";

export default function CategoriesPage() {
  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Kategorie</h2>
            <p className="text-neutral-500">Przeciągaj kategorie, aby zmienić kolejność wyświetlania w menu.</p>
          </div>
        </div>
        <SortableCategoryList />
      </div>
    </DashboardShell>
  );
}
