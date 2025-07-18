import { FiMoreHorizontal } from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";

export const columns = (handleDeleteClick, handleEditClick) => [
  {
    accessorKey: "name",
    header: "Item Name",
    size: 450,
    cell: ({ row }) => (
      <div className="flex items-center space-x-6 my-2 ml-2">
        <img
          src={row.original.image}
          alt={row.original.name}
          className="rounded-md w-50 h-35 object-cover"
        />
        <p className="text-waterspout text-wrap font-semibold">
          {row.original.name}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "serialNumber",
    header: "Serial Number",
    cell: ({ row }) => {
      const serialNumber = row.getValue("serialNumber");
      return <span className="text-waterspout">{serialNumber || "N/A"}</span>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "room",
    header: "Room",
  },
  {
    accessorKey: "purchaseDate",
    header: "Purchase Date",
    cell: ({ row }) => {
      const date = new Date(row.original.purchaseDate);
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    // Format the amount as a MYR amount
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("ms-MY", {
        style: "currency",
        currency: "MYR",
      })
        .format(price)
        .replace(/\s/, ""); // Remove space between currency symbol and amount

      return <span>{formatted}</span>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    size: 50,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0 hover:bg-waterspout">
              <span className="sr-only">Open menu</span>
              <FiMoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="font-dmsans bg-[#003442] text-waterspout border-[#0e5353]"
          >
            <DropdownMenuItem className="focus:bg-waterspout focus:text-[#003442] cursor-pointer"
            onClick={(e) => handleEditClick(e, row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-waterspout focus:text-[#003442] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(e, row.original._id);
            }}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
