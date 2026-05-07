import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {handleApiError} from "../utils/handleApiError";

const API_BASE = "https://ames-appetites-backend.vercel.app/api/restaurants";

const Search = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inlineError, setInlineError] = useState("");

  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setInlineError("");

        const params = new URLSearchParams();
        if (selectedCuisine) params.append("categories", selectedCuisine);
        if (selectedPrice) params.append("price", selectedPrice);

        const res = await fetch(`${API_BASE}?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch restaurants");

        const data = await res.json();
        setRestaurants(data);
      } catch (error) {
        handleApiError(error, navigate, setInlineError);
      } finally {
        setLoading(false);
      }
    };
    console.log("Selected filters:", { selectedCuisine, selectedPrice });
    fetchRestaurants();
  }, [selectedCuisine, selectedPrice, navigate]);

  const cuisineOptions = useMemo(() => {
    const allCategories = restaurants.flatMap((restaurant) =>
      Array.isArray(restaurant.categories) ? restaurant.categories : [],
    );

    return [...new Set(allCategories)].sort();
  }, [restaurants]);

  const priceOptions = useMemo(() => {
    const allPrices = restaurants.map((restaurant) => restaurant.price).filter(Boolean);
    return [...new Set(allPrices)].sort();
  }, [restaurants, navigate]);
  
  return (
    <div className="mx-auto max-w-7xl">
      <div
        className="filters"
        style={{ margin: "20px 0", display: "flex", gap: "12px" }}
      >
        <select
            className="bg-white/65 backdrop-blur-md rounded-md shadow px-3 py-1"
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(e.target.value)}
        >
          <option value="">Cuisines & Themes</option>
          {cuisineOptions.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine}
            </option>
          ))}
        </select>

        <select
            className="bg-white/65 backdrop-blur-md rounded-md shadow px-3 py-1"
          value={selectedPrice}
          onChange={(e) => setSelectedPrice(e.target.value)}
        >
          <option value="">Prices</option>
          {priceOptions.map((price) => (
            <option key={price} value={price}>
              {price}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading restaurants...</p>}
      {inlineError && <p>{inlineError}</p>}

      <div
        className="restaurant-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant._id}
            to={`/restaurant/${restaurant._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              className="bg-white/65 backdrop-blur-md rounded-xl shadow p-4 space-y-2"
            >
              <img
                src={restaurant.imageUrl}
                alt={restaurant.title}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />

              <h3 className="text-md font-bold mb-6">{restaurant.title}</h3>
              <p><span className="font-semibold">Address: </span> {restaurant.address}</p>
              <p><span className="font-semibold">Categories: </span>{restaurant.categories?.join(", ") || "No categories listed"}</p>
              <p><span className="font-semibold">Price: </span> {restaurant.price || "Price not specified"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Search;
