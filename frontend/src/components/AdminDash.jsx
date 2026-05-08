import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handleApiError } from "../utils/handleApiError";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalReviews: 0,
    totalFavorites: 0,
    totalUsers: 0,
    recentReviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [inlineError, setInlineError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://ames-appetites-backend.vercel.app/api/admin/stats", {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw {
            reponse: {
              status: res.status,
              data,
            },
          };
        }

        setStats(data);
      } catch (error) {
        handleApiError(error, navigate, setInlineError);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const statCards = [
    { label: "Restaurants", value: stats.totalRestaurants },
    { label: "Reviews", value: stats.totalReviews },
    { label: "Favorites", value: stats.totalFavorites },
    { label: "Users", value: stats.totalUsers },
  ];

  return (
    <main className="relative min-h-screen bg-linear-to-br from-red-600 to-yellow-400 overflow-hidden">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-white/65 backdrop-blur-md p-6 shadow-md">
          <h1 className="text-4xl font-bold text-red-700">Admin Dashboard</h1>
          <p className="mt-2 text-lg">
            Monitor Ames Appetites data and jump into management tools.
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl bg-white/65 backdrop-blur-md p-6 shadow-md"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
                {card.label}
              </p>
              <p className="mt-3 text-4xl font-bold">
                {loading ? "..." : card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl bg-white/65 backdrop-blur-md p-6 shadow-md">
            <h2 className="mb-4 text-3xl font-bold text-red-700">
              Recent Reviews
            </h2>

            <div className="space-y-4">
              {stats.recentReviews?.length > 0 ? (
                stats.recentReviews.map((review) => (
                  <div key={review._id} className="rounded-xl bg-[#f7dfc7] p-4">
                    <h3 className="text-xl font-bold">{review.authorName}</h3>
                    <p className = "text-sm text-stone-700">{new Date(review.createdAt).toLocaleDateString()}</p>
                    <p className="mt-2"> {review.restaurantName}</p>
                    <p className="mt-2">{review.comment || "No comment provided."}</p>
                    <p className="mt-2 font-medium">Rating: {review.rating} / 5</p>
                  </div>
                ))
              ) : (
                <p>No recent reviews found.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/65 backdrop-blur-md p-6 shadow-md">
            <h2 className="mb-4 text-3xl font-bold text-red-700">
              Quick Actions
            </h2>

            <div className="flex flex-col gap-4">
              <Link
                to="/admin/manage/view"
                className="rounded-xl bg-red-600 px-4 py-3 text-center font-semibold text-white hover:bg-red-700"
              >
                Open Admin Management
              </Link>

              <Link
                to="/admin/manage/add"
                className="rounded-xl bg-red-600 px-4 py-3 text-center font-semibold text-white hover:bg-red-700"
              >
                Add New Restaurant
              </Link>

              <Link
                to="/admin/manage/reviews"
                className="rounded-xl bg-red-600 px-4 py-3 text-center font-semibold text-white hover:bg-red-700"
              >
                Manage Reviews
              </Link>

              <Link
                to="/search"
                className="rounded-xl bg-red-600 px-4 py-3 text-center font-semibold text-white hover:bg-red-700"
              >
                Verify on Search Page
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
