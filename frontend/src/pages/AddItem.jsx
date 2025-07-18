import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  FiPackage,
  FiDollarSign,
  FiFileText,
  FiCamera,
  FiUpload,
} from "react-icons/fi";
import { Separator } from "../components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { DialogClose } from "../components/ui/dialog";
import { MdOutlineDateRange } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";

function AddItem({ onItemAdded, onItemUpdated, item }) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [deletedAttachments, setDeletedAttachments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "", // optional
    brand: "",
    model: "",
    condition: "",
    image: null,
    attachments: [], // optional
    category: "",
    room: "",
    purchaseDate: "",
    purchaseLocation: "",
    price: "",
    warranty: "", // optional
    notes: "", // optional
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        serialNumber: item.serialNumber || "",
        brand: item.brand || "",
        model: item.model || "",
        condition: item.condition || "",
        image: null,
        attachments: [],
        category: item.category || "",
        room: item.room || "",
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : "",
        purchaseLocation: item.purchaseLocation || "",
        price: item.price || "",
        warranty: item.warranty ? new Date(item.warranty) : "",
        notes: item.notes || "",
      });
      setExistingAttachments(item.attachments || []);
    }
  }, [item]);

  const steps = [
    { number: 1, title: "Basic Info", icon: FiPackage },
    { number: 2, title: "Financial", icon: FiDollarSign },
    { number: 3, title: "Product Details", icon: FiFileText },
    { number: 4, title: "Media", icon: FiCamera },
  ];

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (item === null) {
      // If item doesn't exist, we are in "Add Item" mode
      if (currentStep === 1) {
        if (!formData.name) newErrors.name = "Item name is required";
        if (!formData.condition) newErrors.condition = "Condition is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.room) newErrors.room = "Room is required";
      }

      if (currentStep === 2) {
        if (!formData.price || Number.parseFloat(formData.price) <= 0) {
          newErrors.price = "Valid price is required";
        }
        if (!formData.purchaseDate) newErrors.purchaseDate = "Purchase date is required";
        if (!formData.purchaseLocation) newErrors.purchaseLocation = "Purchase location is required";
      }

      if (currentStep === 3) {
        if (!formData.brand) newErrors.brand = "Brand is required";
        if (!formData.model) newErrors.model = "Model is required";
      }

      if (currentStep === 4) {
        if (!formData.image) newErrors.image = "Image is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextSteps = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFinalSubmit = (e) => {
    if (validateStep(currentStep)) {
      handleSubmit(e);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const handleImageUpload = (e) => {
    // ✅
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const removeImagePreview = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const removeAttachment = (index, type = "new") => {
    if (type === "new") {
      const newAttachments = [...formData.attachments];
      newAttachments.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        attachments: newAttachments,
      }));
    } else {
      // Mark for deletion
      setDeletedAttachments((prev) => [
        ...prev,
        existingAttachments[index]._id || existingAttachments[index].filename,
      ]);
      const updated = [...existingAttachments];
      updated.splice(index, 1);
      setExistingAttachments(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitForm = new FormData();

    // Append all non-file related form data (text fields)
    for (const key in formData) {
      if (key !== "image" && key !== "attachments") {
        submitForm.append(key, formData[key]);
      }
    }

    if (formData.image) submitForm.append("image", formData.image);

    // --- Handle NEW Attachments ---
    formData.attachments.forEach((file) => {
      submitForm.append("attachments", file);
    });

    // --- Handle DELETED Attachments ---
    // These are IDs of files to be removed from S3 and MongoDB
    deletedAttachments.forEach((id) => {
      submitForm.append("deletedAttachments", id);
    });

    try {
      if (item && item._id) {
        // Edit mode
        await axios.patch(`/api/homeitems/${item._id}`, submitForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (onItemUpdated) onItemUpdated();
        toast.success(`Item updated successfully`);
      } else {
        // Add mode
        await axios.post("/api/homeitems", submitForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (onItemAdded) onItemAdded();
        toast.success("Item added successfully");
      }
    } catch (error) {
      console.error("Error uploading file:", error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step) => (
          <div key={step.number} className="flex items-center gap-x-[2px]">
            {/* Current step icon */}
            <div
              className={`flex items-center justify-center size-8  rounded-full text-white
            ${currentStep >= step.number ? "bg-waterspout" : "bg-[#1f6f6f]"}`}
            >
              <step.icon
                className={`size-4 ${
                  currentStep >= step.number ? "text-[#001b2e]" : ""
                }`}
              />
            </div>
            {/* Step title */}
            <span
              className={`ml-2 font-semibold ${
                currentStep >= step.number
                  ? "text-waterspout"
                  : "text-[#1f6f6f]"
              }`}
            >
              {step.title}
            </span>
            {/* Separator */}
            {step.number < steps.length && (
              <div
                className={`flex-grow h-[1.5px] rounded-full w-20 ${
                  currentStep > step.number ? "bg-waterspout" : "bg-[#1f6f6f]"
                } mx-2`}
              />
            )}
          </div>
        ))}
      </div>

      <Separator className="bg-[#1f6f6f]" />

      {/* Steps Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <Card className="border-[#1f6f6f] border shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-waterspout text-xl">
                <FiPackage className="size-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-waterspout">
              {/* Item name field */}
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="name">
                  Item Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  className="border-[#1f6f6f] rounded-sm text-waterspout placeholder:text-[#368888]"
                  placeholder="Enter item name"
                  onChange={handleInputChange}
                  value={formData.name}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 -mt-[2px]">
                    {errors.name}
                  </p>
                )}
              </div>
              {/* Category & Room selection field */}
              <div className="flex gap-x-7">
                <div className="selectCategory space-y-2 flex-1">
                  <Label className="font-semibold" htmlFor="category">
                    Category
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange({
                        target: { name: "category", value },
                      })
                    }
                    value={formData.category}
                  >
                    <SelectTrigger
                      id="category"
                      className="w-full border-[#1f6f6f] text-waterspout"
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Appliances">Appliances</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Collectibles & Art">
                          Collectibles & Art
                        </SelectItem>
                        <SelectItem value="Jewelry & Valuables">
                          Jewelry & Valuables
                        </SelectItem>
                        <SelectItem value="Miscellaneous">
                          Miscellaneous
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500 -mt-[2px]">
                      {errors.category}
                    </p>
                  )}
                </div>
                <div className="selectRoom space-y-2 flex-1">
                  <Label className="font-semibold" htmlFor="room">
                    Room
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange({ target: { name: "room", value } })
                    }
                    value={formData.room}
                  >
                    <SelectTrigger
                      id="room"
                      className="w-full border-[#1f6f6f] text-waterspout"
                    >
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Living room">Living room</SelectItem>
                        <SelectItem value="Dining room">Dining room</SelectItem>
                        <SelectItem value="Kitchen">Kitchen</SelectItem>
                        <SelectItem value="Bedroom">Bedroom</SelectItem>
                        <SelectItem value="Bathroom">Bathroom</SelectItem>
                        <SelectItem value="Garage">Garage</SelectItem>
                        <SelectItem value="Storage">Storage</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.room && (
                    <p className="text-sm text-red-500 -mt-[2px]">
                      {errors.room}
                    </p>
                  )}
                </div>
              </div>
              {/* Condition selection field */}
              <div className="mt-6 space-y-2">
                <Label className="font-semibold" htmlFor="condition">
                  Condition
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "condition", value },
                    })
                  }
                  value={formData.condition}
                >
                  <SelectTrigger
                    id="condition"
                    className="w-full border-[#1f6f6f] text-waterspout"
                  >
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <p className="text-sm text-red-500 -mt-[2px]">
                    {errors.condition}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="border-[#1f6f6f] border shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-waterspout text-xl">
                <FiDollarSign className="size-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-waterspout">
              {/* Price field */}
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="price">
                  Price (RM)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  onChange={handleInputChange}
                  value={formData.price}
                  className="border-[#1f6f6f] rounded-sm text-waterspout placeholder:text-[#368888]"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-sm text-red-500 -mt-[2px]">
                    {errors.price}
                  </p>
                )}
              </div>
              <div className="flex gap-x-7">
                {/* Purchase Date field */}
                <div className="selectDate space-y-2 flex-1">
                  <Label className="font-semibold" htmlFor="purchaseDate">
                    Purchase Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={`justify-start w-full bg-transparent hover:bg-[#2c525c] cursor-pointer border border-[#1f6f6f]
                            ${
                              formData.purchaseDate
                                ? "text-waterspout"
                                : "text-[#368888]"
                            }`}
                      >
                        <MdOutlineDateRange
                          className={`size-4 ${
                            formData.purchaseDate
                              ? "text-waterspout"
                              : "text-[#368888]"
                          }`}
                        />
                        {formData.purchaseDate
                          ? formData.purchaseDate.toLocaleDateString()
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={formData.purchaseDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          handleInputChange({
                            target: { name: "purchaseDate", value: date },
                          });
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.purchaseDate && (
                    <p className="text-sm text-red-500 -mt-[2px]">
                      {errors.purchaseDate}
                    </p>
                  )}
                </div>
                {/* Purchase Location field */}
                <div className="space-y-2 flex-1">
                  <Label className="font-semibold" htmlFor="purchaseLocation">
                    Purchase Location
                  </Label>
                  <Input
                    id="purchaseLocation"
                    name="purchaseLocation"
                    type="text"
                    onChange={handleInputChange}
                    value={formData.purchaseLocation}
                    className="border-[#1f6f6f] rounded-sm text-waterspout placeholder:text-[#368888]"
                    placeholder="Where did you buy this item?"
                  />
                  {errors.purchaseLocation && (
                    <p className="text-sm text-red-500 -mt-[2px]">
                      {errors.purchaseLocation}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="border-[#1f6f6f] border shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-waterspout text-xl">
                <FiFileText className="size-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-waterspout">
              <div className="flex gap-x-7">
                {/* Brand field */}
                <div className="space-y-2 flex-1">
                  <Label className="font-semibold" htmlFor="brand">
                    Brand
                  </Label>
                  <Input
                    id="brand"
                    name="brand"
                    type="text"
                    onChange={handleInputChange}
                    value={formData.brand}
                    className="border-[#1f6f6f] rounded-sm text-waterspout placeholder:text-[#368888]"
                    placeholder="Enter brand"
                  />
                  {errors.brand && (
                    <p className="text-sm text-red-500 -mt-[2px]">
                      {errors.brand}
                    </p>
                  )}
                </div>
                {/* Model field */}
                <div className="space-y-2 flex-1">
                  <Label className="font-semibold" htmlFor="model">
                    Model
                  </Label>
                  <Input
                    id="model"
                    name="model"
                    type="text"
                    onChange={handleInputChange}
                    value={formData.model}
                    className="border-[#1f6f6f] rounded-sm text-waterspout placeholder:text-[#368888]"
                    placeholder="Enter model"
                  />
                  {errors.model && (
                    <p className="text-sm text-red-500 -mt-[2px]">
                      {errors.model}
                    </p>
                  )}
                </div>
              </div>
              {/* Serial Number field */}
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="serialNumber">
                  Unique Identifier / Serial Number
                </Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  type="text"
                  onChange={handleInputChange}
                  value={formData.serialNumber}
                  className="border-[#1f6f6f] rounded-sm text-waterspout placeholder:text-[#368888]"
                  placeholder="Enter serial number"
                />
              </div>
              {/* Warranty field */}
              <div className="selectWarranty space-y-2 flex-1">
                <Label className="font-semibold" htmlFor="warranty">
                  Warranty Expiration
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className={`justify-start w-full bg-transparent hover:bg-[#2c525c] cursor-pointer border border-[#1f6f6f]
                            ${
                              formData.warranty
                                ? "text-waterspout"
                                : "text-[#368888]"
                            }`}
                    >
                      <MdOutlineDateRange
                        className={`size-4 ${
                          formData.warranty
                            ? "text-waterspout"
                            : "text-[#368888]"
                        }`}
                      />
                      {formData.warranty
                        ? formData.warranty.toLocaleDateString()
                        : "Select warranty expiration"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={formData.warranty}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        handleInputChange({
                          target: { name: "warranty", value: date },
                        });
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Notes field */}
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="notes">
                  Notes
                </Label>
                <textarea
                  id="notes"
                  name="notes"
                  onChange={handleInputChange}
                  value={formData.notes}
                  rows={3}
                  placeholder="Enter your notes"
                  className="w-full border border-[#1f6f6f] rounded-sm p-2 placeholder:text-[#368888]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card className="border-[#1f6f6f] border shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-waterspout text-xl">
                <FiCamera className="size-5" />
                Photos & Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-waterspout">
              <div>
                <Label className="text-base" htmlFor="image">
                  Photo
                </Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#1f6f6f] border-dashed rounded-lg cursor-pointer bg-transparent hover:bg-[#083745]">
                    <div className="flex flex-col items-center justify-center py-6 text-sea-kale">
                      <FiUpload className="size-8 mb-4" />
                      <p className="mb-2 text-sm">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  {errors.image && (
                    <p className="text-sm text-center text-red-500 mt-1">
                      {errors.image}
                    </p>
                  )}
                </div>
              </div>

              {/* Display uploaded image */}
              {formData.image && (
                <div className="mt-2">
                  <div className="relative w-fit">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Uploaded"
                      className="w-75 h-35 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 size-6 rounded-full p-0 cursor-pointer"
                      onClick={removeImagePreview}
                    >
                      <IoClose className="size-3" />
                    </Button>
                  </div>
                  {errors.image = null}
                </div>
              )}

              {/* Attachments */}
              <div>
                <Label className="text-base" htmlFor="attachments">
                  Attachments (Receipts, Manuals, etc.)
                </Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#1f6f6f] border-dashed rounded-lg cursor-pointer bg-transparent hover:bg-[#083745]">
                    <div className="flex flex-col items-center justify-center py-6 text-sea-kale">
                      <FiFileText className="size-8 mb-4" />
                      <p className="mb-2 text-sm">Upload documents</p>
                    </div>
                    <Input
                      type="file"
                      id="attachments"
                      name="attachments"
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleAttachmentUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Display uploaded files */}
              {(existingAttachments.length > 0 ||
                formData.attachments.length > 0) && (
                <div className="space-y-2 mt-4">
                  {/* Existing attachments from DB */}
                  {existingAttachments.map((file, index) => (
                    <div
                      key={`existing-${index}`}
                      className="flex items-center justify-between px-3 py-4 border border-[#1f6f6f] rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FiFileText className="size-4 text-[#1f6f6f]" />
                        <span className="text-sm">
                          {file.filename || file.name}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="cursor-pointer bg-transparent text-waterspout hover:bg-[#083745]"
                        onClick={() => removeAttachment(index, "existing")}
                      >
                        <IoClose className="size-4" />
                      </Button>
                    </div>
                  ))}
                  {/* New attachments not yet saved to DB */}
                  {formData.attachments.map((file, index) => (
                    <div
                      key={`new-${index}`}
                      className="flex items-center justify-between px-3 py-4 border border-[#1f6f6f] rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FiFileText className="size-4 text-[#1f6f6f]" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        size="sm"
                        className="cursor-pointer bg-transparent text-waterspout hover:bg-[#083745]"
                        onClick={() => removeAttachment(index, "new")}
                      >
                        <IoClose className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <div className="flex justify-between pt-4">
        <Button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="cursor-pointer"
        >
          Previous
        </Button>
        <div className="flex gap-2">
          <DialogClose asChild>
            <Button className="cursor-pointer bg-waterspout text-[#001b2e] hover:bg-[#9ad9d9]">
              Cancel
            </Button>
          </DialogClose>
          {currentStep < 4 ? (
            <Button
              onClick={nextSteps}
              className="cursor-pointer text-waterspout bg-[#001b2e] hover:bg-waterspout hover:text-[#001b2e]"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="cursor-pointer text-waterspout bg-[#001b2e] hover:bg-waterspout hover:text-[#001b2e]"
            >
              {isSubmitting ? (
                <>
                  <ClipLoader color="#b5ffff" size={19} />
                  {item && item._id ? "Updating item..." : "Adding item..."}
                </>
              ) : item && item._id ? (
                "Update Item"
              ) : (
                "Add Item"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
export default AddItem;
