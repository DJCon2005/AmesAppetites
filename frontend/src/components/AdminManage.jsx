import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { handleApiError } from "../utils/handleApiError";

const emptyRestaurant = {
  title: "",
  address: "",
  city: "",
  imageUrl: "",
  menu: "",
  website: "",
  price: "",
  description: "",
  categories: "",
  specialtyDish: "",
  isDishOfTheWeek: false,
  averageRating: 0.1,
  placeId: "",
  url: "",
};

const AdminManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurant);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const {activePanel} = useParams();
  const location = useLocation();

  async function loadRestaurants() {
    try {
      const res = await fetch("http://localhost:8081/api/restaurants");
      const data = await res.json();

      if (!res.ok) {
        throw {
          response: {
            status: res.status,
            data,
          },
        };
      }

      setRestaurants(data);
    } catch (error) {
      handleApiError(error, navigate, setMessage);
    }
  }

  async function loadRecentReviews() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:8081/api/admin/recent-reviews",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw {
          response: {
            status: res.status,
            data,
          },
        };
      }
      setRecentReviews(data);
    } catch (error) {
      handleApiError(error, navigate, setMessage);
    }
  }

  useEffect(() => {
    loadRestaurants();
    loadRecentReviews();
  }, []);

  function handleRestaurantChange(e) {
    const { name, value } = e.target;
    setRestaurantForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddRestaurant(e) {
    e.preventDefault();
    try {
      const payload = {
        ...restaurantForm,
        categories: restaurantForm.categories
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8081/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        handleApiError(
          {
            response: {
              status: res.status,
              data,
            },
          },
          navigate,
          setMessage,
        );
        return;
      }

      setMessage("Restaurant added successfully.");
      setRestaurantForm(emptyRestaurant);
      loadRestaurants();
    } catch (error) {
      handleApiError(error, navigate, setMessage);
    }
  }

  async function handleLoadRestaurantForEdit(id) {
    try {
      setSelectedRestaurantId(id);

      const res = await fetch(`http://localhost:8081/api/restaurants/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw {
          response: {
            status: res.status,
            data,
          },
        };
      }

      setRestaurantForm({
        ...data,
        categories: Array.isArray(data.categories)
          ? data.categories.join(", ")
          : "",
      });

      handlePanelChange("edit");
    } catch (error) {
      handleApiError(error, navigate, setMessage);
    }
  }

  async function handleUpdateRestaurant(e) {
    e.preventDefault();
    try {
      const payload = {
        ...restaurantForm,
        categories: restaurantForm.categories
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };

      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/restaurants/${selectedRestaurantId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        handleApiError(
          {
            response: {
              status: res.status,
              data,
            },
          },
          navigate,
          setMessage,
        );
        return;
      }

      setMessage("Restaurant updated successfully.");
      setRestaurantForm(emptyRestaurant);
      setSelectedRestaurantId("");
      handlePanelChange("view");
      loadRestaurants();
    } catch (error) {
      handleApiError(error, navigate, setMessage);
    }
  }

  async function handleDeleteRestaurant(id) {
    const confirmed = window.confirm("Delete this restaurant?");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:8081/api/restaurants/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        handleApiError(
          {
            response: {
              status: res.status,
              data,
            },
          },
          navigate,
          setMessage,
        );
        return;
      }

      setMessage(`Deleted ${data.title}`);
      loadRestaurants();
    } catch (error) {
      handleApiError(error, navigate, setMessage);
    }
  }

  async function handleDeleteReview(id) {
    const confirmed = window.confirm("Delete this review?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8081/api/reviews/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        handleApiError(
          {
            response: {
              status: res.status,
              data,
            },
          },
          navigate,
          setMessage,
        );
        return;
      }
      setMessage("Review deleted successfully.");
      loadRecentReviews();
    } catch (error) {
      handleApiError(error, navigate, setMessage);
    }
  }

  const handlePanelChange = (panelKey) => {
    navigate(`/admin/manage/${panelKey}`);
  }

  const navButtons = [
    { key: "view", label: "View Restaurants" },
    { key: "add", label: "Add Restaurant" },
    { key: "reviews", label: "Manage Reviews" },
  ];

  function strToBool(str) {
    const {name, value} = str.target;

    const finalValue = name === "isDishOfTheWeek" ? value === "true" : value;
    setRestaurantForm((prev) => ({ ...prev, [name]: finalValue }));
  }

  return (
    <main className="relative min-h-screen bg-linear-to-br from-red-600 to-yellow-400 overflow-hidden">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-white/65 backdrop-blur-md p-6 shadow-md">
          <h1 className="text-4xl font-bold text-red-700">Admin Management</h1>
          <p className="mt-2 text-lg">
            Manage restaurants, categories, pricing tiers, and recent reviews.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-white/65 backdrop-blur-md p-4 font-medium">
            {message}
          </div>
        )}

        <div className="mb-8 flex flex-wrap gap-3">
          {navButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => handlePanelChange(btn.key)}
              className={`rounded-xl px-5 py-3 font-semibold ${
                activePanel === btn.key
                  ? "bg-red-600 text-white"
                  : "bg-white/65 backdrop-blur-md text-stone-900"
              } hover:bg-red-700 hover:text-white`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {activePanel === "view" && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((r) => (
              <div
                key={r._id}
                className="rounded-2xl bg-white/65 backdrop-blur-md p-5 shadow-md"
              >
                <img
                  src={
                    r.imageUrl || "https://placehold.co/400x250?text=Restaurant"
                  }
                  alt={r.title}
                  className="mb-4 h-52 w-full rounded-xl object-cover"
                />
                <h2 className="text-2xl font-bold text-red-700">{r.title}</h2>
                <p className="mt-2">
                  <strong>Address:</strong> {r.address}
                </p>
                <p>
                  <strong>City:</strong> {r.city}
                </p>
                <p>
                  <strong>Price:</strong> {r.price || "N/A"}
                </p>
                <p>
                  <strong>Categories:</strong>{" "}
                  {r.categories?.join(", ") || "N/A"}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleLoadRestaurantForEdit(r._id)}
                    className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteRestaurant(r._id)}
                    className="rounded-lg bg-stone-800 px-4 py-2 font-semibold text-white hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activePanel === "add" && (
          <form
            id="restaurant-form"
            onSubmit={handleAddRestaurant}
            className="grid gap-4 rounded-2xl bg-white/65 backdrop-blur-md p-6 shadow-md md:grid-cols-2"
          >
            <input
              name="title"
              value={restaurantForm.title}
              onChange={handleRestaurantChange}
              placeholder="Restaurant Title"
              className="rounded-xl p-3"
              required
            />
            <input
              name="address"
              value={restaurantForm.address}
              onChange={handleRestaurantChange}
              placeholder="Address"
              className="rounded-xl p-3"
              required
            />
            <input
              name="city"
              value={restaurantForm.city}
              onChange={handleRestaurantChange}
              placeholder="City"
              className="rounded-xl p-3"
              required
            />
            <input
              name="imageUrl"
              value={restaurantForm.imageUrl}
              onChange={handleRestaurantChange}
              placeholder="Image URL"
              className="rounded-xl p-3"
            />
            <input
              name="website"
              value={restaurantForm.website}
              onChange={handleRestaurantChange}
              placeholder="Website"
              className="rounded-xl p-3"
            />
            <input
              name="menu"
              value={restaurantForm.menu}
              onChange={handleRestaurantChange}
              placeholder="Menu URL"
              className="rounded-xl p-3"
            />
            <input
              name="price"
              value={restaurantForm.price}
              onChange={handleRestaurantChange}
              placeholder="Price ($, $$, $$$)"
              className="rounded-xl p-3"
            />
            <input
              name="specialtyDish"
              value={restaurantForm.specialtyDish}
              onChange={handleRestaurantChange}
              placeholder="Specialty Dish"
              className="rounded-xl p-3"
            />
            <select
              name="isDishOfTheWeek"
              value={restaurantForm.isDishOfTheWeek}
              onChange={strToBool}
              placeholder="Is Dish of the Week? (true/false)"
              className="rounded-xl p-3">
                <option value={false}>Not Dish of the Week(False)</option>
                <option value={true}>Dish of the Week(True)</option>
            </select>
            
            <input
              name="placeId"
              value={restaurantForm.placeId}
              onChange={handleRestaurantChange}
              placeholder="Google Place ID"
              className="rounded-xl p-3"
            />
            <input
              name="url"
              value={restaurantForm.url}
              onChange={handleRestaurantChange}
              placeholder="Google Maps URL"
              className="rounded-xl p-3"
            />
            <input
              name="categories"
              value={restaurantForm.categories}
              onChange={handleRestaurantChange}
              placeholder="Categories comma separated"
              className="rounded-xl p-3 md:col-span-2"
            />
            <textarea
              name="description"
              value={restaurantForm.description}
              onChange={handleRestaurantChange}
              placeholder="Description"
              className="rounded-xl p-3 md:col-span-2"
              rows="4"
            />
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white md:col-span-2 hover:bg-red-700"
            >
              Add Restaurant
            </button>
          </form>
        )}

        {activePanel === "edit" && (
          <form
            onSubmit={handleUpdateRestaurant}
            className="grid gap-4 rounded-2xl bg-white/65 backdrop-blur-md p-6 shadow-md md:grid-cols-2"
          >
            <input
              name="title"
              value={restaurantForm.title}
              onChange={handleRestaurantChange}
              placeholder="Restaurant Title"
              className="rounded-xl p-3"
              required
            />
            <input
              name="address"
              value={restaurantForm.address}
              onChange={handleRestaurantChange}
              placeholder="Address"
              className="rounded-xl p-3"
              required
            />
            <input
              name="city"
              value={restaurantForm.city}
              onChange={handleRestaurantChange}
              placeholder="City"
              className="rounded-xl p-3"
              required
            />
            <input
              name="imageUrl"
              value={restaurantForm.imageUrl}
              onChange={handleRestaurantChange}
              placeholder="Image URL"
              className="rounded-xl p-3"
            />
            <input
              name="website"
              value={restaurantForm.website}
              onChange={handleRestaurantChange}
              placeholder="Website"
              className="rounded-xl p-3"
            />
            <input
              name="menu"
              value={restaurantForm.menu}
              onChange={handleRestaurantChange}
              placeholder="Menu URL"
              className="rounded-xl p-3"
            />
            <input
              name="price"
              value={restaurantForm.price}
              onChange={handleRestaurantChange}
              placeholder="Price ($, $$, $$$)"
              className="rounded-xl p-3"
            />
            <input
              name="specialtyDish"
              value={restaurantForm.specialtyDish}
              onChange={handleRestaurantChange}
              placeholder="Specialty Dish"
              className="rounded-xl p-3"
            />
            <select
              name="isDishOfTheWeek"
              value={restaurantForm.isDishOfTheWeek}
              onChange={strToBool}
              placeholder="Is Dish of the Week? (true/false)"
              className="rounded-xl p-3">
                <option value={false}>Not Dish of the Week(False)</option>
                <option value={true}>Dish of the Week(True)</option>
            </select>

            <input
              name="placeId"
              value={restaurantForm.placeId}
              onChange={handleRestaurantChange}
              placeholder="Google Place ID"
              className="rounded-xl p-3"
            />
            <input
              name="url"
              value={restaurantForm.url}
              onChange={handleRestaurantChange}
              placeholder="Google Maps URL"
              className="rounded-xl p-3"
            />
            <input
              name="categories"
              value={restaurantForm.categories}
              onChange={handleRestaurantChange}
              placeholder="Categories comma separated"
              className="rounded-xl p-3 md:col-span-2"
            />
            <textarea
              name="description"
              value={restaurantForm.description}
              onChange={handleRestaurantChange}
              placeholder="Description"
              className="rounded-xl p-3 md:col-span-2"
              rows="4"
            />
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white md:col-span-2 hover:bg-red-700"
            >
              Update Restaurant
            </button>
          </form>
        )}

        {activePanel === "reviews" && (
          <div className="rounded-2xl bg-white/65 backdrop-blur-md p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-red-700">
              Recent Reviews (Last 10 Days)
            </h2>

            <div className="space-y-4">
              {recentReviews.length > 0 ? (
                recentReviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-xl bg-[#f7dfc7] p-4 flex flex-col gap-3"
                  >
                    <div>
                      <p className="text-lg font-bold">{review.authorName}</p>
                      <p className="text-sm text-stone-700">
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <p>
                      <strong>Rating:</strong> {review.rating} / 5
                    </p>
                    <p>
                      <strong>Comment:</strong>{" "}
                      {review.comment}
                    </p>

                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="w-fit rounded-lg bg-stone-800 px-4 py-2 font-semibold text-white hover:bg-gray-700"
                    >
                      Delete Review
                    </button>
                  </div>
                ))
              ) : (
                <p>No reviews from the last 10 days.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminManagement;
