import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AppSidebar } from "../components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import {
  IoGridOutline,
  IoListOutline,
  IoAddOutline,
  IoFilter,
} from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { columns } from "../inventories/columns";
import { DataTable } from "../inventories/data-table";
import axios from "axios";
import AddItem from "./AddItem";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "../components/ui/badge";
import { ClipLoader } from "react-spinners";

function Home() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingId, setIsDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gridView, setGridView] = useState(
    localStorage.getItem("viewMode") || "list"
  );
  const [data, setData] = useState([]);
  const [dataError, setDataError] = useState(null);
  const totalItems = data.length;
  const totalEstimatedValue = data.reduce(
    (acc, currentItem) => acc + currentItem.price,
    0
  );

  const [editItem, setEditItem] = useState(null);

  const formattedTotalValue = new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
  })
    .format(totalEstimatedValue)
    .replace(/\s/, "");

  const fetchItems = async () => {
    axios
      .get("/api/homeitems")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setDataError(error.message);
        console.error("Error fetching items:", error.message);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    localStorage.setItem("viewMode", gridView);
  }, [gridView]);

  if (dataError) return <div>Error fetching data: {dataError}</div>;

  const [categories, setCategories] = useState({
    electronics: false,
    appliances: false,
    furniture: false,
    collectibles: false,
    jewelry: false,
    miscellaneous: false,
  });
  const [rooms, setRooms] = useState({
    livingRoom: false,
    diningRoom: false,
    kitchen: false,
    bedroom: false,
    bathroom: false,
    garage: false,
    storage: false,
  });

  const categoriesOptions = [
    { value: "electronics", label: "Electronics" },
    { value: "appliances", label: "Appliances" },
    { value: "furniture", label: "Furniture" },
    { value: "collectibles", label: "Collectibles & Art" },
    { value: "jewelry", label: "Jewelry & Valuables" },
    { value: "miscellaneous", label: "Miscellaneous" },
  ];
  const roomsOptions = [
    { value: "livingroom", label: "Living Room" },
    { value: "diningroom", label: "Dining Room" },
    { value: "kitchen", label: "Kitchen" },
    { value: "bedroom", label: "Bedroom" },
    { value: "bathroom", label: "Bathroom" },
    { value: "garage", label: "Garage" },
    { value: "storage", label: "Storage" },
  ];

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price);

    const formattedPrice = new Intl.NumberFormat("ms-MY", {
      style: "currency",
      currency: "MYR",
    })
      .format(numericPrice)
      .replace(/\s/, "");

    return formattedPrice;
  };

  
  const handleItemAdded = () => {
    setIsAddDialogOpen(false);
    fetchItems();
  };
  
  const handleEditClick = (e, item) => {
    e.stopPropagation();
    setEditItem(item);
    setIsAddDialogOpen(true);
  };
  
  const handleItemUpdated = () => {
    setIsAddDialogOpen(false);
    setEditItem(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/homeitems/${id}`);
      console.log("Item deleted successfully: ", id);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error.message);
    }
  };

  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    setIsDeletingId(id);
    await handleDelete(id);
    setIsDeletingId(null);
  };

  // --- Filtering ---
  const activeCategories = Object.keys(categories).filter(
    (key) => categories[key]
  );
  const activeRooms = Object.keys(rooms).filter((key) => rooms[key]);

  const filteredData = data.filter((item) => {
    const itemCategory = item.category ? item.category.toLowerCase() : "";
    const itemRoom = item.room
      ? item.room.toLowerCase().replace(/\s/g, "")
      : "";

    const matchesCategory =
      activeCategories.length === 0 || activeCategories.includes(itemCategory);
    const matchesRoom =
      activeRooms.length === 0 || activeRooms.includes(itemRoom);
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesRoom && matchesSearch;
  });

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-[#003442] font-dmsans">
        <header>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-start">
              <SidebarTrigger className="ml-3  size-7 scale-[1.2] text-waterspout hover:bg-waterspout cursor-pointer" />
              <div className="ml-4">
                <p className="text-waterspout font-semibold text-3xl">
                  Dashboard
                </p>
                <span className=" text-sea-kale text-sm -space-y-12">
                  Welcome, User1!
                </span>
              </div>
            </div>
            <div className="flex items-center gap-x-6 mr-10">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>shadcn</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main>
          {/* Summary */}
          <section>
            <h1 className="text-waterspout font-dmsans font-semibold text-2xl ml-14 mt-12">
              Summary
            </h1>
            <div className="mx-14 mt-6 flex gap-5">
              {/* Total Items Card  */}
              <div className="w-fit flex-1 h-30 rounded-xl bg-[#0e5353] py-4 px-8 text-[#58c1c1] font-semibold shadow-lg">
                <p>Total Items</p>
                <p className="text-4xl mt-2 text-waterspout">{totalItems}</p>
              </div>
              {/* Estimated Value Card */}
              <div className="w-fit flex-1 min-h-30 max-h-fit rounded-xl bg-[#0e5353] py-4 px-8 text-[#58c1c1] font-semibold shadow-lg">
                <p>Total Estimated Value</p>
                <p className="text-4xl mt-2 text-waterspout break-all">
                  {formattedTotalValue}
                </p>
              </div>
              {/* Total Categories Card */}
              <div className="w-fit flex-1 h-30 rounded-xl bg-[#0e5353] py-4 px-8 text-[#58c1c1] font-semibold shadow-lg">
                <p>Total Categories</p>
                <p className="text-4xl mt-2 text-waterspout">
                  {categoriesOptions.length}
                </p>
              </div>
              {/* Total Rooms Card */}
              <div className="w-fit flex-1 h-30 rounded-xl bg-[#0e5353] py-4 px-8 text-[#58c1c1] font-semibold shadow-lg">
                <p>Total Rooms</p>
                <p className="text-4xl mt-2 text-waterspout">
                  {roomsOptions.length}
                </p>
              </div>
            </div>
          </section>

          {/* Search & Filter */}
          <section>
            <div className="mx-14 mt-10 flex gap-4">
              {/* Search bar */}
              <Input
                placeholder="Search items..."
                className="w-full h-11 border-[#0e5353] bg-[#0e53535a] text-waterspout placeholder:text-[#368181]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Filter dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 cursor-pointer text-waterspout border-[#0e5353] bg-[#0e53535a] hover:bg-waterspout hover:text-[#093643]"
                  >
                    <IoFilter /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 font-dmsans bg-[#0e5353] border-[#0e5353] text-[#87d5d5]"
                  align="end"
                >
                  <DropdownMenuLabel className="font-semibold text-base text-waterspout">
                    Categories
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {categoriesOptions.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={categories[option.value]}
                        onCheckedChange={(checked) =>
                          setCategories({
                            ...categories,
                            [option.value]: checked,
                          })
                        }
                        onSelect={(e) => e.preventDefault()}
                      >
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-[#0e5353]" />
                  <DropdownMenuLabel className="font-semibold text-base text-waterspout">
                    Rooms
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {roomsOptions.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={rooms[option.value]}
                        onCheckedChange={(checked) =>
                          setRooms({ ...rooms, [option.value]: checked })
                        }
                        onSelect={(e) => e.preventDefault()}
                      >
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Add Item Button */}
              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (!open) setEditItem(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    type="submit"
                    className="h-11 cursor-pointer text-[#093643] bg-waterspout hover:bg-[#75d0d0]"
                  >
                    <IoAddOutline className="size-5 text-[#093643]" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-4xl max-h-[90vh] font-dmsans bg-[#0b4758] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-waterspout">
                      {editItem ? "Edit Item" : "Add New Item"}
                    </DialogTitle>
                    <DialogDescription className="text-[#57bcbc]">
                      {editItem
                        ? "Edit the details of your item"
                        : "Add a new item to your home inventory with detailed information"}
                    </DialogDescription>
                  </DialogHeader>
                  <AddItem
                    onItemAdded={handleItemAdded}
                    onItemUpdated={handleItemUpdated}
                    item={editItem}
                  />
                </DialogContent>
              </Dialog>
              {/* View Toggle */}
              <ToggleGroup
                type="single"
                value={gridView}
                onValueChange={(value) => setGridView(value)}
              >
                <ToggleGroupItem
                  value="grid"
                  defaultValue
                  className="h-full px-5 hover:bg-[#0b4141] border-sea-kale cursor-pointer data-[state=on]:text-waterspout data-[state=on]:bg-[#0e5353] data-[state=off]:text-sea-kale"
                >
                  <IoGridOutline className="size-[18px]" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="list"
                  className="h-full px-5 hover:bg-[#0b4141] border-sea-kale cursor-pointer data-[state=on]:text-waterspout data-[state=on]:bg-[#0e5353] data-[state=off]:text-sea-kale"
                >
                  <IoListOutline className="size-[18px]" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </section>

          {/* Item Table */}
          <section>
            <div className=" mx-14 py-10">
              {gridView === "list" ? (
                <DataTable
                  columns={columns(handleDeleteClick, handleEditClick)}
                  data={filteredData}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredData.map((item) => (
                    <Card
                      key={item._id}
                      className="bg-[#0e5353] rounded-lg shadow-none py-5 cursor-pointer hover:shadow-xl hover:scale-103 duration-200"
                      onClick={() => navigate(`/homeitems/${item._id}`)}
                    >
                      <CardContent className="px-5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 rounded-lg"
                        />
                        <h3 className="mt-2 font-bold text-waterspout text-lg truncate">
                          {item.name}
                        </h3>
                      </CardContent>
                      <CardFooter className="block -mt-2">
                        {/* Categories & Rooms */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-waterspout font-semibold bg-[#226a6a] border border-sea-kale py-1 px-[10px] rounded-full">
                            {item.category}
                          </span>
                          <span className="text-sm text-[#7ac7c7]">
                            {item.room}
                          </span>
                        </div>
                        {/* Price & Condition */}
                        <div className="flex justify-between mt-2">
                          <span className="font-semibold text-waterspout">
                            {formatPrice(item.price)}
                          </span>
                          <Badge
                            variant={
                              item.condition === "Excellent"
                                ? "excellent"
                                : item.condition === "Good"
                                ? "good"
                                : item.condition === "Fair"
                                ? "fair"
                                : "destructive"
                            }
                          >
                            {item.condition}
                          </Badge>
                        </div>
                        {/* Edit & Delete Buttons */}
                        <div className="flex justify-end mt-4 gap-x-[10px]">
                          <Button className="cursor-pointer bg-waterspout text-[#001b2e] hover:bg-[#9ad9d9]"
                            onClick={(e) => handleEditClick(e, item)}
                          >
                            <FiEdit className="size-4" />
                          </Button>
                          <Button
                            className="cursor-pointer text-waterspout bg-[#001b2e] hover:bg-waterspout hover:text-[#001b2e]"
                            disabled={deletingId === item._id}
                            onClick={(e) => handleDeleteClick(e, item._id)}
                          >
                            {deletingId === item._id ? (
                              <>
                                <ClipLoader color="#b5ffff" size={19} />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <MdDeleteOutline className="size-5" />
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Home;
