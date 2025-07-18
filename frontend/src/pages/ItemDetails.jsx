import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { IoNotifications, IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "../components/ui/button";
import { FiDollarSign, FiFileText, FiDownload } from "react-icons/fi";
import { Separator } from "@/components/ui/separator";
import { LuDoorOpen } from "react-icons/lu";
import { BiSolidCategory } from "react-icons/bi";
import { MdOutlineDateRange } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { ClipLoader } from "react-spinners";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const options = { year: "numeric", month: "long", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-UK", options);
  };

  useEffect(() => {
    axios
      .get(`/api/homeitems/${id}`)
      .then((response) => {
        setItem(response.data.item);
      })
      .catch((error) => {
        if (error.response) {
          setError(error.response.data.message);
          console.error(error.response.data.message);
        } else {
          setError("An unexpected error occurred.");
          console.error(error);
        }
      });
  }, [id]);

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl; 
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <SidebarInset className="min-h-screen bg-[#003442] font-dmsans">
        {error ? (
          <Card className="bg-[#0e5353] max-w-sm m-auto shadow-lg">
            <CardContent className="text-center mx-4 my-2 space-y-4">
              <p className="text-lg font-semibold m-0 text-waterspout">
                Item Not Found
              </p>
              <p className="text-sea-kale">
                The requested item could not be found.
              </p>
              <Button
                variant="none"
                className="bg-[#001b2e] hover:bg-[#15242f] text-waterspout cursor-pointer"
                onClick={() => navigate("/")}
              >
                Back to Inventory
              </Button>
            </CardContent>
          </Card>
        ) : item ? (
          <>
            <header>
              <div className="mt-4 ml-4 flex items-center justify-between">
                <div className="ml-4 flex items-start gap-x-4">
                  <div>
                    <Button
                      variant="none"
                      className="cursor-pointer bg-waterspout text-[#003442] hover:bg-[#94cfcf]"
                      onClick={() => navigate("/")}
                    >
                      <IoArrowBack />
                    </Button>
                  </div>
                  <div>
                    <p className="text-waterspout font-semibold text-3xl">
                      {item ? item.name : "Item Details"}
                    </p>
                    <span className=" text-sea-kale text-sm -space-y-12">
                      {item ? item.category : ""} • {item ? item.room : ""}
                    </span>
                  </div>
                </div>
                <div className="mr-10">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>shadcn</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </header>
            <main className="flex mx-20 my-4 gap-8">
              <div>
                {/* Image Card */}
                <Card className="itemPhoto bg-[#0e5353] max-w-fit shadow-lg">
                  <CardContent>
                    {item && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-130 h-auto rounded-lg"
                      />
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-transparent cursor-pointer border border-sea-kale text-waterspout hover:bg-[#001b2e] hover:border-[#001b2e]">
                      Update Photo
                    </Button>
                  </CardFooter>
                </Card>
                {/* Quick Info Card */}
                <Card className="quickInfo bg-[#0e5353] text-waterspout w-full mt-6 shadow-lg">
                  <CardHeader>
                    <p>Quick Info</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <FiDollarSign size={20} className="text-green-400" />
                      <div>
                        <p className="text-[#87bdbd]">Value</p>
                        <p className="text-lg">
                          {item && formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4 bg-waterspout" />
                    <div className="flex items-center gap-4">
                      <LuDoorOpen size={20} className="text-yellow-400" />
                      <div>
                        <p className="text-[#87bdbd]">Room</p>
                        <p className="text-lg">{item && item.room}</p>
                      </div>
                    </div>
                    <Separator className="my-4 bg-waterspout" />
                    <div className="flex items-center gap-4">
                      <BiSolidCategory size={20} className="text-purple-400" />
                      <div>
                        <p className="text-[#87bdbd]">Category</p>
                        <p className="text-lg">{item && item.category}</p>
                      </div>
                    </div>
                    <Separator className="my-4 bg-waterspout" />
                    <div className="flex items-center gap-4">
                      <MdOutlineDateRange size={20} className="text-blue-400" />
                      <div>
                        <p className="text-[#87bdbd]">Purchase Date</p>
                        <p className="text-lg">
                          {item && formatDate(item?.purchaseDate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="w-full">
                {/* Item Details Card */}
                <Card className="itemDetails bg-[#0e5353] text-waterspout shadow-lg">
                  <CardHeader>
                    <p className="text-2xl font-medium">Item Details</p>
                  </CardHeader>
                  <CardContent>
                    {item ? (
                      <div>
                        <div className="flex gap-x-5">
                          <div className="flex-1">
                            <p className="text-[#57bcbc]">Condition</p>
                            <Badge
                              className="mb-4"
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
                            <p className="text-[#57bcbc]">Brand</p>
                            <p className="mb-4">{item.brand}</p>
                            <p className="text-[#57bcbc]">Warranty Until</p>
                            <p className="mb-4">
                              {item.warranty
                                ? formatDate(item.warranty)
                                : "N/A"}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[#57bcbc]">
                              Unique Identifier / Serial Number
                            </p>
                            <p className="mb-4">{item.serialNumber}</p>
                            <p className="text-[#57bcbc]">Model</p>
                            <p className="mb-4">{item.model}</p>
                            <p className="text-[#57bcbc]">Purchase Location</p>
                            <p className="mb-4">{item.purchaseLocation}</p>
                          </div>
                        </div>
                        <p className="text-[#57bcbc]">Notes</p>
                        <p>{item.notes}</p>
                      </div>
                    ) : (
                      <p>Loading item details...</p>
                    )}
                  </CardContent>
                </Card>
                {/* Attachments Card */}
                <Card className="attachments bg-[#0e5353] text-waterspout mt-6 shadow-lg">
                  <CardHeader>
                    <p className="text-2xl font-medium">Attachments</p>
                  </CardHeader>
                  <CardContent>
                    {/* Display uploaded documents of the item */}
                    {item.attachments && item.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {item.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-3 py-4 border border-[#1f6f6f] rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FiFileText className="size-4 text-[#87bdbd]" />
                              <span className="text-sm">{file.filename}</span>
                            </div>
                            <Button
                              size="sm"
                              className="cursor-pointer bg-transparent text-waterspout hover:bg-[#083745]"
                              onClick={() => handleDownload(file.url, file.filename)}
                            >
                              <FiDownload className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sea-kale mb-4">
                        No attachments available for this item.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-waterspout">
            <ClipLoader color="#b5ffff" size={80} />
            <p>Loading item details...</p>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default ItemDetails;
