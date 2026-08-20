"use client";

import { Button } from "@ros/ui";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
}

export function OrdersPagination({ page, totalPages, total, limit, onPageChange, onLimitChange }: Props) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2);
  const deduped = visible.filter((p, i, arr) => i === 0 || p - arr[i - 1] === 1);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-400">
          {total} zamówień | strona {page} z {totalPages}
        </span>
        <select
          className="px-2 py-1 rounded-lg border border-neutral-200 text-sm"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ←
        </Button>
        {deduped.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          →
        </Button>
      </div>
    </div>
  );
}
