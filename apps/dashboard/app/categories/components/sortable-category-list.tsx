"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Edit3, Eye, EyeOff } from "lucide-react";
import { dashApi } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string;
}

function SortableCategoryItem({
  category,
  onEdit,
  onToggle,
  onDelete,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition ${
        !category.isActive ? "opacity-60" : ""
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        aria-label="Przeciągnij"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Image */}
      {category.imageUrl ? (
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
          Brak
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{category.name}</p>
        <p className="text-sm text-gray-500">/{category.slug}</p>
      </div>

      {/* Order badge */}
      <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full text-gray-600">
        #{category.sortOrder}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggle(category.id, !category.isActive)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          title={category.isActive ? "Dezaktywuj" : "Aktywuj"}
        >
          {category.isActive ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => onEdit(category)}
          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
          title="Edytuj"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
          title="Usuń"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function SortableCategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await dashApi.getCategories();
      setCategories(data.sort((a: Category, b: Category) => a.sortOrder - b.sortOrder));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);

    const newOrder = arrayMove(categories, oldIndex, newIndex);
    // Update sortOrder values
    const updated = newOrder.map((c, i) => ({ ...c, sortOrder: i }));
    setCategories(updated);

    // Save to API
    try {
      setSaving(true);
      await dashApi.reorderCategories(
        updated.map((c) => ({ id: c.id, sortOrder: c.sortOrder }))
      );
    } catch (e: any) {
      setError(`Błąd zapisu: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await dashApi.updateCategory(id, { isActive });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive } : c))
      );
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę kategorię?")) return;
    try {
      await dashApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEdit = (category: Category) => {
    const newName = prompt("Nowa nazwa kategorii:", category.name);
    if (!newName || newName === category.name) return;
    dashApi
      .updateCategory(category.id, { name: newName })
      .then(() =>
        setCategories((prev) =>
          prev.map((c) => (c.id === category.id ? { ...c, name: newName } : c))
        )
      )
      .catch((e: any) => setError(e.message));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p className="font-semibold">Błąd</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadCategories}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {saving && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          Zapisywanie kolejności...
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {categories.map((category) => (
              <SortableCategoryItem
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg font-medium">Brak kategorii</p>
          <p className="text-sm">Dodaj pierwszą kategorię, aby rozpocząć.</p>
        </div>
      )}
    </div>
  );
}
