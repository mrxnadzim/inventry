import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useNavigate } from "react-router";
import { ClipLoader } from "react-spinners";

export function DataTable({ columns, data, isLoading }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  const navigate = useNavigate();

  return (
    <div className="rounded-md border border-sea-kale overflow-hidden">
      <Table>
        <TableHeader className="bg-[#0e53535a]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-sea-kale">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="text-waterspout"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-waterspout"
              >
                <ClipLoader color="#b5ffff" size={25} />
                <p>Loading data...</p>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="cursor-pointer border-sea-kale"
                onClick={() => navigate(`/homeitems/${row.original._id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-waterspout">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-waterspout"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
