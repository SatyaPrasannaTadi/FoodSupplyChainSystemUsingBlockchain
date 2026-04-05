

Node.js (v14 or higher) installed. 
download link : https://nodejs.org/



MongoDB installed and running locally, or a MongoDB Atlas connection string. 
download link : https://www.mongodb.com/try/download/community


Project Structure

- `app/`: Frontend Next.js application.
- `backend/`: Express.js backend API.



Backend Setup

Navigate to the backend directory
Open your terminal (Command Prompt/PowerShell on Windows, Terminal on Mac) and run:

cd backend

Install Dependencies

npm install

Configure Environment Variables

Create a `.env` file in the `backend` directory if it doesn't exist. Add the following:


MONGO_URI=mongodb://localhost:27017/foodtrace
JWT_SECRET=your_jwt_secret_key
PORT=5000


Start the Backend Server

npm start

or 

node index.js

You should see: `Server running on port 5000`.


Frontend Setup

Navigate to the project root (if not already there)

Open a new terminal window/tab.

cd ..


Install Dependencies


npm install


Start the Development Server


npm run dev


Access the App
Open your browser and go to `http://localhost:3000`.

