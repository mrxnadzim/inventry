import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Inventory from "./models/inventory.js";
import multer from "multer";
import path from "path";
import { uploadImageToS3, deleteImageFromS3, getSignedUrlForImage, deleteAttachmentFromS3 } from "./s3.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.get("/api/homeitems", async (req, res) => {
  try {
    const homeItems = await Inventory.find({});

    // Create a new array of items that includes the signed URL for the image
    const itemsWithSignedUrls = await Promise.all(
      homeItems.map(async (item) => {
        const imageUrl = await getSignedUrlForImage(item.image);
        return {
          ...item.toObject(), // Convert mongoose doc to plain object
          image: imageUrl,
        };
      })
    );
    res.status(200).json(itemsWithSignedUrls);
  } catch (error) {
    console.error('Error fetching items: ', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/homeitems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const attachmentsWithSignedUrls = await Promise.all(
      item.attachments.map(async (attachment) => ({
        ...attachment.toObject(),
        url: await getSignedUrlForImage(attachment.url),
      }))
    );

    const imageUrl = await getSignedUrlForImage(item.image);
    const itemWithSignedUrl = {
      ...item.toObject(),
      image: imageUrl,
      attachments: attachmentsWithSignedUrls,
    };

    res.status(200).json({ success: true, item: itemWithSignedUrl });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/homeitems", upload.fields([{ name: "image", maxCount: 1 }, { name: "attachments", maxCount: 5 }]), async (req, res) => {
  try {

    // 1. get all text fields from req.body
    const { name, serialNumber, brand, model, condition, category, room, purchaseDate, purchaseLocation, price, warranty, notes } = req.body;
    // if (!name || !brand || !model || !condition || !category || !room || !purchaseDate || !purchaseLocation || !price) {
    //   return res.status(400).json({ success: false, message: "All fields are required" });
    // }

    // 2. get image and attachments from req.files
    const image = req.files.image ? req.files.image[0] : null;
    const attachments = req.files.attachments ? req.files.attachments : [];

    if (!image) {
      return res.status(400).json({ message: "An image file is required." });
    }

    // 3. Generate a unique file name of img and upload img for S3
    const fileName = `images/${Date.now()}-${image.originalname}`;
    const contentType = image.mimetype;
    const fileBuffer = image.buffer;
    const imageUrl = await uploadImageToS3(fileBuffer, fileName, contentType);

    // 4. Upload attachments to S3 if any
    const attachmentsData = [];
    for (const file of attachments) {
      const attachmentFileName = `attachments/${Date.now()}-${file.originalname}`;
      const attachmentUrl = await uploadImageToS3(file.buffer, attachmentFileName, file.mimetype);
      attachmentsData.push({
        url: attachmentUrl,
        filename: file.originalname,
      });
    }

    // 5. Create the new item with the S3 URLs
    const newInventoryItem = new Inventory({
      name,
      serialNumber,
      brand,
      model,
      condition,
      image: imageUrl,
      category,
      room,
      purchaseDate,
      purchaseLocation,
      price,
      warranty,
      notes,
      attachments: attachmentsData
    });

    await newInventoryItem.save();
    res.status(201).json({ message: 'Item added successfully', item: newInventoryItem });
  } catch (error) {
    console.error("Error creating inventory item: \n", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/api/homeitems/:id", upload.fields([{ name: "image", maxCount: 1 }, { name: "attachments", maxCount: 5 }]), async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Update text fields
    const { name, serialNumber, brand, model, condition, category, room, purchaseDate, purchaseLocation, price, warranty, notes } = req.body;
    item.name = name || item.name;
    item.serialNumber = serialNumber || item.serialNumber;
    item.brand = brand || item.brand;
    item.model = model || item.model;
    item.condition = condition || item.condition;
    item.category = category || item.category;
    item.room = room || item.room;
    item.purchaseDate = purchaseDate || item.purchaseDate;
    item.purchaseLocation = purchaseLocation || item.purchaseLocation;
    item.price = price || item.price;
    item.warranty = warranty || item.warranty;
    item.notes = notes || item.notes;

    // Handle image upload
    const image = req.files.image ? req.files.image[0] : null;
    if (image) {
      // Delete old image from S3 if it exists
      if (item.image) {
        const oldImageParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: item.image,
        };
        await deleteImageFromS3(oldImageParams);
      }

      // Upload new image
      const fileName = `images/${Date.now()}-${image.originalname}`;
      const contentType = image.mimetype;
      const fileBuffer = image.buffer;
      const imageUrl = await uploadImageToS3(fileBuffer, fileName, contentType);
      item.image = imageUrl;
    }

    // Parse deletedAttachments from req.body (may be array or string)
    let deletedAttachments = req.body.deletedAttachments || [];
    if (typeof deletedAttachments === "string") {
      deletedAttachments = [deletedAttachments];
    }

    // Remove deleted attachments from item.attachments and S3
    if (deletedAttachments.length > 0) {
      item.attachments = item.attachments.filter(att => {
        const shouldDelete = deletedAttachments.includes(att._id?.toString() || att.filename);
        if (shouldDelete) {
          // Delete from S3
          const attachmentParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: att.url,
          };
          deleteAttachmentFromS3(attachmentParams);
        }
        return !shouldDelete;
      });
    }

    // 6. Handle attachments upload
    const attachments = req.files.attachments ? req.files.attachments : [];
    for (const file of attachments) {
      const attachmentFileName = `attachments/${Date.now()}-${file.originalname}`;
      const attachmentUrl = await uploadImageToS3(file.buffer, attachmentFileName, file.mimetype);
      item.attachments.push({
        url: attachmentUrl,
        filename: file.originalname,
      });
    }

    // 7. Save the updated item
    await item.save();
    res.status(200).json({ success: true, message: "Item updated successfully", item });
  } catch (error) {
    console.error("Error updating inventory item: \n", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/homeitems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Inventory.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Delete the image for item with the given id from S3
    const imageParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: deletedItem.image,

    }
    const deleteImage = await deleteImageFromS3(imageParams);
    if (!deleteImage) {
      return res.status(500).json({ success: false, message: "Failed to delete image from S3" });
    }

    // Delete all attachments for item with the given id from S3
    if (deletedItem.attachments && deletedItem.attachments.length > 0) {
      for (const attachment of deletedItem.attachments) {
        const attachmentParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: attachment.url,
        };
        const deleteAttachment = await deleteAttachmentFromS3(attachmentParams);
        if (!deleteAttachment) {
          return res.status(500).json({ success: false, message: "Failed to delete attachment from S3" });
        }
      }
    }

    res.status(200).json({ success: true, message: "Item deleted successfully", itemDeleted: deletedItem });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
