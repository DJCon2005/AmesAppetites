import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const searchRef = useRef(null);

  // Check login status on mount and when storage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (error) {
          console.error("Failed to parse user:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();

    //Listen for auth changes
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle dynamic search
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        setIsDropdownOpen(false);
        return;
      }

      try {
        const res = await fetch(`https://ames-appetites-backend.vercel.app/api/restaurants?search=${searchQuery}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setIsDropdownOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 2. A clean, simple function to handle the search bar
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery(""); // clear the box after hitting enter
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    showAlert("Logged out successfully!");

    navigate("/");
  };

  const showAlert = (message) => {
    const alertDiv = document.createElement("div");
    alertDiv.textContent = message;
    alertDiv.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out";
    document.body.appendChild(alertDiv);

    setTimeout(() => {
      alertDiv.classList.add("animate-fade-out");
      setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
  };

  // A reusable variable for your link styling so it isn't cluttered
  const linkStyle =
    "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 transition-colors";

  return (
    <nav className="sticky rounded-3xl m-3 border-black bg-white/65 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        {/* --- LEFT: LOGO --- */}
        <div>
          <Link
            to="/"
            className="text-2xl font-bold font-edu-cursive text-red-600"
          >
            Ames<span className="text-yellow-500">Appetites</span>
          </Link>
        </div>

        {/* --- MIDDLE: SEARCH BAR --- */}
        <div className="flex-1 max-w-md px-8">
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim() !== "") setIsDropdownOpen(true);
                }}
                className="w-full bg-white/50 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Search Ames Appetites..."
              />
            </form>

            {/* Search Dropdown */}
            {isDropdownOpen && (
              <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  searchResults.map((restaurant) => (
                    <Link
                      key={restaurant._id}
                      to={`/restaurant/${restaurant._id}`}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setSearchQuery("");
                      }}
                      className="block px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-bold text-red-700">{restaurant.title}</div>
                      <div className="text-xs text-gray-500 truncate">{restaurant.address}</div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">No restaurants found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT: STATIC NAVIGATION LINKS --- */}
        <div className="flex items-center space-x-2">
          <Link to="/dish" className={linkStyle}>
            Dish Of The Week
          </Link>

          {user && (
            <Link to="/favorites" className={linkStyle}>
              Favorites
            </Link>
          )}

          <Link to="/about" className={linkStyle}>
            About Us
          </Link>

          {user?.role === "admin" && (
            <Link to="/admin" className={linkStyle}>
              Admin Dashboard
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-3 ml-4">
              <span className="text-sm font-medium text-gray-700">
                Hi, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
