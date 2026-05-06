import { useLocation, useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const error = location.state?.error || {};
  const status = error.status || 500;
  const title =
    error.title || (status === 404 ? "Page not found" : "Something went wrong");
  const message =
    error.message ||
    (status === 404
      ? "The page or resource you requested could not be found."
      : "An unexpected server error occurred.");

  return (
    <div className="relative min-h-screen bg-linear-to-br from-red-600 to-yellow-400 overflow-hidden text-center flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold mb-4 justify-center">{status}</h1>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 max-w-md mb-6">{message}</p>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
        >
          Return Home
        </button>

        <button
          onClick={() => navigate(-1)}
          className="rounded-lg bg-stone-800 px-4 py-2 font-semibold text-white hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
