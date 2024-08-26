const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, {
  cors: {
    origin: "https://client-murex-six.vercel.app",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8000;

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

module.exports = { io };

const buildingdetailRoutes = require("./routes/buildingdetailsRoutes.js");
const adminbuildingsRouter = require("./routes/adminBuilding.js");
const buildingroutes = require("./routes/buidlingroutes");
// Configuring Middlewares
const useMiddlewares = require("./utils/useMiddlewares");
useMiddlewares(app);

// Configuring Routes
const useRoutes = require("./utils/useRoutes.js");
useRoutes(app);
app.use("/api", buildingroutes);
app.use("/api/customer", buildingdetailRoutes);
app.use("/admin/api/buildings", adminbuildingsRouter);
// Connecting to MongoDB
app.get("/", (req, res) => {
  res.send("Hello World!");
});
module.exports = (req, res) => {
  return app(req, res);
};
const connectDB = require("./utils/db");
connectDB().then(() => {
  // Starting Server
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
