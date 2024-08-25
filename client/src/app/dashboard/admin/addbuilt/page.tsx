"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useDispatch } from "react-redux";
import { addBuilding } from "../../../../lib/features/action/building"; // Adjust the path as necessary
import "./style.css";
import Cookies from "js-cookie";

interface Slot {
  number: number;
  isAvailable: boolean;
}

interface Floor {
  number: number;
  slots: Slot[];
}

interface Building {
  ImgUrl: string;
  name: string;
  address: string;
  floors: Floor[];
  description: string;
  price: number; // Added price field
}

const AddBuildingForm: React.FC = () => {
  const initialBuildingState: Building = {
    ImgUrl: "",
    name: "",
    address: "",
    floors: [],
    description: "",
    price: 0, // Initialize price
  };

  const [building, setBuilding] = useState<Building>(initialBuildingState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const dispatch = useDispatch();

  // Assuming you have a method to get the current user's role from a Redux store or context
  // const userRole = Cookies.get("role");
  // if (userRole !== "admin") {
  //   // Redirect to a 403 page if the user is not an admin
  //   window.location.href = "/home/403";
  //   return null; // Prevent rendering of the form
  // }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBuilding((prevBuilding) => ({
      ...prevBuilding,
      [name]: name === "price" ? parseFloat(value) : value, // Handle price conversion
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSlotChange = (floorIndex: number, slotIndex: number, e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    const updatedFloors = [...building.floors];
    const updatedSlots = [...updatedFloors[floorIndex].slots];
    updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], isAvailable: checked };
    updatedFloors[floorIndex] = { ...updatedFloors[floorIndex], slots: updatedSlots };
    setBuilding((prevBuilding) => ({
      ...prevBuilding,
      floors: updatedFloors,
    }));
  };

  const addFloor = () => {
    setBuilding((prevBuilding) => ({
      ...prevBuilding,
      floors: [...prevBuilding.floors, { number: prevBuilding.floors.length + 1, slots: [] }],
    }));
  };

  const addSlot = (floorIndex: number) => {
    const updatedFloors = [...building.floors];
    updatedFloors[floorIndex].slots.push({ number: updatedFloors[floorIndex].slots.length + 1, isAvailable: true });
    setBuilding((prevBuilding) => ({
      ...prevBuilding,
      floors: updatedFloors,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!building.name || !building.address || building.price <= 0) {
      alert('Name, Address, and Price are required fields.');
      return;
    }

    const formData = new FormData();
    if (imageFile) {
      formData.append("ImgUrl", imageFile);
    }
    formData.append("name", building.name);
    formData.append("address", building.address);
    formData.append("description", building.description);
    formData.append("price", building.price.toString()); // Append price as string
    formData.append("floors", JSON.stringify(building.floors));

    try {
      await dispatch(addBuilding(formData));
      alert('Building added successfully!');
      setBuilding(initialBuildingState);
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      console.error('Error adding building:', error);
      alert('Failed to add building');
    }
  };

  return (
    <div className="addToCartFormContainer">
      <h2>Add Building</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="ImgUrl"
          onChange={handleImageChange}
          className="cartInput"
        />
        {imagePreview && (
          <div className="imagePreviewContainer">
            <img src={imagePreview} alt="Preview" className="imagePreview" />
          </div>
        )}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={building.name}
          onChange={handleChange}
          className="cartInput"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={building.address}
          onChange={handleChange}
          className="cartInput"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={building.description}
          onChange={handleChange}
          className="cartInput"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={building.price}
          onChange={handleChange}
          className="cartInput"
        />
        <div>
          <button type="button" onClick={addFloor} className="cartButton">
            Add Floor
          </button>
        </div>
        {building.floors.map((floor, floorIndex) => (
          <div key={floorIndex} className="floorContainer">
            <h3>Floor {floor.number}</h3>
            <div>
              <button type="button" onClick={() => addSlot(floorIndex)} className="cartButton">
                Add Slot
              </button>
            </div>
            {floor.slots.map((slot, slotIndex) => (
              <div key={slotIndex} className="slotContainer">
                <h4>Slot {slot.number}</h4>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={slot.isAvailable}
                  onChange={(e) => handleSlotChange(floorIndex, slotIndex, e)}
                />
                <label>Available</label>
              </div>
            ))}
          </div>
        ))}
        <button type="submit" className="cartButton">
          Add Building
        </button>
      </form>
    </div>
  );
};

export default AddBuildingForm;
