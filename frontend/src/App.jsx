import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Homepage from "./components/Homepage";
import Search from "./components/Search";
import Restaurant from "./components/Restaurant";
import AboutUs from "./components/AboutUs";
import SignLogIn from "./components/SignLogIn";
import ErrorPage from "./components/ErrorPage";
import AdminDash from "./components/AdminDash";
import AdminManage from "./components/AdminManage";
import DishOfTheWeek from "./components/DishOfTheWeek";
import Favorites from "./components/Favorites";
import Reviews from "./components/Reviews";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-linear-to-br from-red-600 to-yellow-400 overflow-hidden">
        <Navbar />
        <Routes>
          {/* Public routes*/}
          <Route path="/" element={<Homepage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<SignLogIn />} />
          <Route path="/dish" element={<DishOfTheWeek />} />
          <Route path="/error" element={<ErrorPage />} />

          {/* User-only routes*/}
          <Route 
            path="/favorites" 
              element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                <Favorites />
              </ProtectedRoute>
              }
          />
          <Route 
            path="/reviews/:restaurantId" 
              element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                <Reviews />
              </ProtectedRoute>
              }
          />

          {/* Admin-only routes*/}
          <Route 
            path="/admin" 
              element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDash />
              </ProtectedRoute>
              }
          />
          <Route 
            path="/admin/manage/:activePanel" 
              element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminManage />
              </ProtectedRoute>
              }
          />

          {/* 404 catch-all*/}
          <Route
            path="*"
            element={
              <Navigate
                to="/error"
                replace
                state={{
                  error: {
                    status: 404,
                    title: "Page not found",
                    message: "That route does not exist",
                  },
                }}
              />
            }
          />
          
        </Routes>
                <footer className="text-center text-stone-900 font-medium md:flex-row justify-between items-center">
                <div>&copy; 2026, Ben Hurley and Dillon Conrad</div>
            </footer>
      </div>
    </Router>
    
  );
}

export default App;
