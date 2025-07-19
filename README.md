# Inventry | Home Inventory Management App
Inventry is a personal full-stack web application for organizing and tracking your household items. It helps users keep a digital record of their possessions, including details, images, and documents, 
making it easier to manage insurance claims, move homes, or simply stay organized. Easily add, edit, and track items, rooms, and attachments (like receipts and manuals) with a modern, responsive UI.

## Features
- Add, edit, and delete inventory items
- Upload images and document attachments (stored in AWS S3)
- Filter and search items by category, room, and name
- Responsive dashboard with summary statistics
- View item details with downloadable attachments

## Tech Stack
### Frontend

- **React + Vite**
- **Tailwind CSS**
- **React Icons**
- **Axios**
- **shadcn UI**
- **React Router**

### Backend
- **Node.js** with **Express**
- **MongoDB** (via Mongoose ODM)
- **AWS S3** (for image and attachment storage)
- **Multer** (file uploads)
- **dotenv** (environment variables)


## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB Atlas account
- AWS S3 bucket and credentials

### Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/inventry.git
   cd inventry
   ```

2. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=your-region
   S3_BUCKET_NAME=your-bucket-name
   MONGO_URI=your-mongodb-uri
   PORT=your-port-number
   ```

3. **Install dependencies**
   ```sh
   npm install
   cd frontend
   npm install
   ```

4. **Run the development server**
   - Start the backend:
     ```sh
     npm run dev
     ```
   - Start the frontend:
     ```sh
     cd frontend
     npm run dev
     ```

5. **Access the app**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## License
This project is [MIT Licensed](https://github.com/mrxnadzim/inventry/blob/main/LICENSE)
