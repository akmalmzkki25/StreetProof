"use client";

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@streetproof/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@streetproof/ui/components/table";
import { cn } from "@streetproof/ui/lib/utils";
import {
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
  type ReactTable,
  type RowData,
} from "@tanstack/react-table";

import { useI18n } from "@/lib/i18n/client";

// Every list in the app sorts and pages on the client and nothing more, so
// they share one feature set.
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
  },
});
export type DataTableFeatures = typeof dataTableFeatures;

export const initialPagination = { pageIndex: 0, pageSize: 20 };

// The table runs edge to edge under the page's toolbar, with a count and the
// pager below it.
export function DataTable<TData extends RowData>({
  table,
  columnClasses = {},
  onRowClick,
  empty,
  footer,
}: {
  table: ReactTable<DataTableFeatures, TData>;
  columnClasses?: Record<string, string>;
  onRowClick?: (row: TData) => void;
  empty: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { t } = useI18n();
  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col">
      <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 sm:[&_td:first-child]:pl-6 sm:[&_td:last-child]:pr-6 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4 sm:[&_th:first-child]:pl-6 sm:[&_th:last-child]:pr-6">
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-10 text-xs font-normal text-muted-foreground",
                      columnClasses[header.column.id],
                    )}
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="-mx-2 inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
                      >
                        <FlexRender header={header} />
                        <HugeiconsIcon
                          icon={
                            sorted === "asc"
                              ? ArrowUp01Icon
                              : sorted === "desc"
                                ? ArrowDown01Icon
                                : ArrowUpDownIcon
                          }
                          className={cn("size-3", !sorted && "opacity-60")}
                        />
                      </button>
                    ) : (
                      <FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={onRowClick ? "cursor-pointer" : undefined}
              // The first cell's link or button is the keyboard path; the
              // rest of the row is a larger target for a pointer.
              onClick={
                onRowClick
                  ? (event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("a, input, label")) return;
                      onRowClick(row.original);
                    }
                  : undefined
              }
            >
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn("py-3", columnClasses[cell.column.id])}
                >
                  <FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length === 0 ? empty : null}
      <div className="type-caption sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-2 border-t glass px-4 py-2.5 text-muted-foreground tabular-nums sm:px-6">
        <span>{footer}</span>
        {pageCount > 1 ? (
          <span className="flex items-center gap-1">
            {t("Page {page} of {pages}", {
              page: table.state.pagination.pageIndex + 1,
              pages: pageCount,
            })}
            <Button
              variant="ghost"
              size="sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              {t("Previous")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              {t("Next")}
            </Button>
          </span>
        ) : null}
      </div>
    </div>
  );
}
