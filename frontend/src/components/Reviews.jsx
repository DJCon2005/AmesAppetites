import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Rating } from "react-simple-star-rating";
import { handleApiError } from "../utils/handleApiError";

export function ReviewStars({ rating, setRating }) {
  // Catch Rating value
  const handleRating = (rate) => {
    setRating(rate);
  };

  return (
    <div className="inline-flex [&_svg]:inline-block">
      <Rating
        onClick={handleRating}
        initialValue={rating}
        transition
        allowFraction
        showTooltip
        tooltipArray={[
          "NEVER eating here again!",
          "I did not enjoy the food.",
          "I can go somewhere better.",
          "Everything was just OK.",
          "The food was decent.",
          "I would eat here again.",
          "This food is pretty good!",
          "I would eat here again soon!",
          "I would go here weekly!",
          "I DONT want to leave!",
        ]}
      />
    </div>
  );
}

const Reviews = () => {
  const { restaurantId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [inlineError, setInlineError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `https://ames-appetites-backend.vercel.app/api/reviews/${restaurantId}`,
        );
  
        if (!res.ok) {
          throw {
            response: {
              status: res.status,
              data,
            },
          };
        }
        const data = await res.json();

        setReviews(data);
      } catch (error) {
        handleApiError(error, navigate, setInlineError);
      }
    };

    fetchReviews();
  }, [restaurantId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://ames-appetites-backend.vercel.app/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, rating, authorName, comment }),
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

      setReviews([data, ...reviews]);
      setRating(0);
      setAuthorName("");
      setComment("");
      setInlineError("");

      setRating(0);
      setAuthorName("");
      setComment("");
    } catch (error) {
      handleApiError(error, navigate, setInlineError);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {inlineError && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
          {inlineError}
        </div>
      )}

      {/* --- FORM SECTION --- */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 p-6 rounded-xl bg-white/20 shadow-sm"
      >
        <h2 className="text-xl font-semibold mb-4">Add a Review</h2>
        <div className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            placeholder="Your Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Write your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div>
            <p className="text-sm text-gray-600 mb-1">Your Rating:</p>
            {/* We pass the state and the setter function down here */}
            <ReviewStars rating={rating} setRating={setRating} />
          </div>
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            Submit Review
          </button>
        </div>
      </form>

      <hr className="my-8" />

      {/* --- DISPLAY SECTION (MAPPING) --- */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev._id} className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{rev.authorName}</h3>
                <span className="text-red-500 font-bold">
                  {rev.rating} / 5
                </span>
              </div>
              <p className="text-gray-700 mt-2">{rev.comment}</p>
              <p className="text-xs text-black-400 mt-2">
                {new Date(rev.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">
            No reviews yet. Be the first to leave one!
          </p>
        )}
      </div>
    </div>
  );
};

export default Reviews;
