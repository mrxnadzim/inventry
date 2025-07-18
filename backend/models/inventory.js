import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    serialNumber: { // optional
        type: String,
        default: "N/A",
    },
    brand: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    condition: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
    purchaseLocation: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    warranty: { // optional
        type: Date,
    },
    notes: { // optional
        type: String,
        default: "",
    },
    attachments: { // optional
        type: [{
            url: { type: String, required: true },
            filename: { type: String, required: true },
        }],
        default: []
    }

}, {
    timestamps: true // creates createdAt and updatedAt
});

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;