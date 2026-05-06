import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleApiError } from "../utils/handleApiError";

const SignLogIn = () => {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [inlineError, setInlineError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");
    setMessage("");

    try {
      const endpoint =
        mode === "login"
          ? "http://localhost:8081/api/auth/login"
          : "http://localhost:8081/api/auth/signup";

      const payload =
        mode === "login"
          ? { username, password }
          : { username, password, role};

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw {
          response: {
            status: res.status,
            data,
          },
        };
      }

      if (mode === "signup") {
        setMessage("Account created successfully. Please log in.");
        showSuccess("Account created successfully!");
        setMode("login");
        setPassword("");
        return;
      }

      //store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      //trigger auth change event for navbar
      window.dispatchEvent(new Event("authChange"));

      showSuccess(`Welcome back, ${data.user.username}!`);
      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate(redirectTo);
        }
      }, 500);
    } catch (err) {
      handleApiError(err, navigate, setInlineError, showFailure, {stayOnPageStatuses: [400, 401, 409]});
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white/70 backdrop-blur-md p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-red-700 mb-2">
          {mode === "login" ? "Log In" : "Sign Up"}
        </h1>
        <p className="text-gray-700 mb-6">
          {mode === "login"
            ? "Access your Ames Appetites account."
            : "Create an account to save favorites and leave reviews."}
        </p>

        {inlineError && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {inlineError}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full rounded-xl border p-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {mode === "signup" && (
            <select
              className="w-full rounded-xl border p-3"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
            </select>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
          >
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setInlineError("");
            setMessage("");
          }}
          className="mt-4 w-full text-sm font-medium text-red-700 hover:underline"
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
};

export default SignLogIn;