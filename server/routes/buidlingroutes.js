const express = require("express");
const router = express.Router();
const Building = require("../models/Building");
const cloudinary = require("cloudinary").v2;
const {
  requireSignin,
  isAdmin,
  isProviderCustomer,
} = require("../middlewares/authmiddleware");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Making a upload Variable
const upload = multer({ storage: storage });

router.post(
  "/buildings",
  upload.single("ImgUrl"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Please upload an image" });
      }
      const uploadResponse = await cloudinary.uploader.upload(req.file.path);

      if (!uploadResponse) {
        return res.status(500).json({ message: "Failed to upload image" });
      }

      const { name, address, description, floors, provider, price } = req.body;
      const parsedFloors = JSON.parse(floors);
      const building = new Building({
        ImgUrl: uploadResponse.secure_url,
        name,
        address,
        description,
        provider,
        available: true,
        floors: parsedFloors,
        price,
      });

      const savedBuilding = await building.save();
      res.status(201).json(savedBuilding);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// GET /api/buildings - Get all buildings
router.get("/buildings/all", async (req, res) => {
  try {
   const buildings = await Building.find({});
    if (!buildings) {
      return res
        .status(404)
        .json({ success: false, message: "No buildings found" });
    }
    console.log(buildings);
    res.json({
      buildings,
      message: "buildings fetched successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      success: false,
      message: "Failed to get buildings",
    });
  }
});

router.get("/buildings/:id", async (req, res) => {
  try {
    const building = await Building.findById(req.params.id).populate(
      "floors.slots.reservations",
      "reservations.reservedBy",
      "name email",
      {
        path: "floors.slots.reservations",
        populate: {
          path: "reservedBy",
          select: "name email",
        },
      }
    );
    if (!building) {
      return res
        .status(404)
        .json({ success: false, message: "Building not found" });
    }
    res.json({
      building,
      success: true,
      message: "Building fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to get building",
    });
  }
});
module.exports = router;
