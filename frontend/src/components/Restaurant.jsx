import React, {useEffect, useState} from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {handleApiError} from "../utils/handleApiError";
import { Rating } from 'react-simple-star-rating'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const API_BASE = "https://ames-appetites-backend.vercel.app/api/restaurants";
const FAVORITES_API = "https://ames-appetites-backend.vercel.app/api/favorites";

const Restaurant = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inlineError, setInlineError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const showAlert = (message, type= "success") =>{
    const alertDiv = document.createElement("div");
    const bgColor = type === "failure" ? "bg-red-500" : "bg-green-500";
    alertDiv.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
      alertDiv.classList.add("animate-fade-out");
      setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
  }

  const showSuccess = (message) => showAlert(message, "success");
  const showFailure = (message) => showAlert(message, "failure");


  console.log(import.meta.env);
  const mapSrc =
    restaurant?.placeId 
      ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=place_id:${restaurant.placeId}`
      : restaurant?.address
      ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${restaurant.address}${restaurant.city ? `, ${restaurant.city}` : ''}`)}`
      : "";

  useEffect( () =>{
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setInlineError("");

        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) throw new Error("Restaurant not found");;

        const data = await res.json();
        setRestaurant(data);

        // Check if favorite
        if (token) {
          const favRes = await fetch(FAVORITES_API, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (favRes.ok) {
            const favData = await favRes.json();
            setIsFavorite(favData.some(fav => fav._id === id));
          }
        }

      }catch (error) {
        handleApiError(error, navigate, setInlineError, showFailure, {stayOnPageStatuses: [400, 401, 409]});
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [id, navigate]);

  const handleReviewsClick = async () => {
    if (!token) {
      navigate('/login', { state: { from: `/restaurant/${id}` } });
      showFailure("You must be logged in to view reviews.");
    } else {
      navigate(`/reviews/${restaurant._id}`);
    }
    return;
  }

  const handleFavoriteClick = async () => {
    if (!token) {
      navigate('/login', { state: { from: `/restaurant/${id}` } });
      showFailure("You must be logged in to manage favorites.");
      return;
    }

    try {
      if (isFavorite) {
        // Remove favorite
        const res = await fetch(`${FAVORITES_API}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setIsFavorite(false);
      } else {
        // Add favorite
        const res = await fetch(FAVORITES_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ restaurantId: id })
        });
        if (res.ok) setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      showFailure('Failed to update favorite status.');
    }
  };

  if(loading) return <p>Loading restaurant...</p>
  if(inlineError) return <p>{inlineError}</p>
  if(!restaurant) return <p>No restaurant data found</p>


  return (
    <div>
      <main className="max-w-6x1 mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">{restaurant.title}</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.title}
              className="w-full h-64 object-cover rounded-xl shadow-md"
            />

            <div className="bg-white/65 backdrop-blur-md rounded-xl shadow p-4 space-y-2">
              <p>
                <span className="font-semibold">Location: </span>
                {restaurant.address}
              </p>
              <p>
                <span className="font-semibold">Cuisine/Theme: </span>
                {restaurant.categories?.join(", ") || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Price: </span>
                {restaurant.price || "N/A"}
              </p>
              <p>
                {/* This may be ugly, but it works */}
                <span className="font-semibold">Average Rating: </span>
                {                                <div className="mt-auto pt-3 inline-flex [&_svg]:inline-block">
                                                    <Rating 
                                                        initialValue={Math.round((restaurant.averageRating || 0) * 2) / 2} 
                                                        readonly={true} 
                                                        size={20} 
                                                        allowFraction={true} 
                                                    />
                                                    <span className="text-xs text-stone-500 ml-2 mt-1">({restaurant.ratingCount || 0})</span>
                                                </div> || "No ratings yet"}
              </p>
              <p>
                <span className="font-semibold">Specialty Dish: </span>
                {restaurant.specialtyDish || "N/A"}
              </p>
            </div>

            <button 
              onClick={handleFavoriteClick}
              className={`w-full py-2 rounded-lg shadow text-white transition-colors ${
                isFavorite 
                  ? 'bg-stone-700 hover:bg-stone-800' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>

            {/* Additional Info & map*/}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white/65 backdrop-blur-md rounded-xl shadow p-4">
              <h2 className="text-2xl font-semibold text-red-700 mb-3">
                About This Restaurant
              </h2>
              <p className="text-gray-700">{restaurant.description || "No description available."}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={restaurant.menu || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
                >
                  View Menu
                </a>

                <a
                  href={restaurant.website || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
                >
                  Website
                </a>

                <button
                  onClick={handleReviewsClick}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
                >
                  View Reviews
                </button>
              </div>
            </div>

            <div className="bg-white/65 backdrop-blur-md rounded-xl shadow p-4">
              <h2 className="text-2xl font-semibold text-red-700 mb-3">Map</h2>
              {mapSrc ? (
              <iframe
                src={mapSrc}
                title={`${restaurant.title} map`}
                className="w-full h-72 rounded-lg border"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-reference-when-downgrade"
              />
              ) : (
                <p>Map unavailable</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Restaurant;
