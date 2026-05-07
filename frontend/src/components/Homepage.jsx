import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating'; // Make sure this is installed via npm
import { handleApiError } from '../utils/handleApiError';

const Homepage = () => {
    const [randomRestaurants, setRandomRestaurants] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomepageData = async () => {
            try {
                setLoading(true);
                
                // Fetch all restaurants
                const res = await fetch('http://ames-appetites-backend.vercel.app/api/restaurants');
                if (res.ok) {
                    const data = await res.json();
                    // Shuffle and pick 3
                    const shuffled = [...data].sort(() => 0.5 - Math.random());
                    setRandomRestaurants(shuffled.slice(0, 3));
                }

                // Fetch favorites if token exists
                const token = localStorage.getItem('token');
                if (token) {
                    const favRes = await fetch('http://ames-appetites-backend.vercel.app/api/favorites', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (favRes.ok) {
                        const favData = await favRes.json();
                        setFavorites(favData);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch homepage data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomepageData();
    }, []);
    return (
        <main className="max-w-6xl mx-auto px-6 py-8">
            {/* Header / Title */}
            <div className="mb-10">
                <h1 className="text-white drop-shadow-md text-center text-4xl font-bold mb-2">Welcome to</h1>
                <h2 className="text-red-800 drop-shadow-md text-center text-6xl font-extrabold tracking-tight">Ames Appetites</h2>
            </div>

            {/* Top Row: 3 Random Restaurants */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                {loading ? (
                    <div className="col-span-3 text-center text-white p-8">Loading restaurants...</div>
                ) : (
                    randomRestaurants.map((restaurant) => (
                        <Link 
                            to={`/restaurant/${restaurant._id}`} 
                            key={restaurant._id} 
                            className="bg-white/65 backdrop-blur-md rounded-xl shadow-md hover:bg-white/80 transition-colors block text-stone-900 border border-white/20 overflow-hidden flex flex-col"
                        >
                            {/* Image mimicking the Restaurant.jsx style */}
                            <img 
                                src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&q=80'} 
                                alt={restaurant.title} 
                                className="w-full h-40 object-cover shadow-sm"
                            />
                            
                            {/* Details mimicking the styling from Restaurant.jsx */}
                            <div className="p-4 flex flex-col grow">
                                <div className="text-center mb-3 pb-2 border-b border-stone-400/30">
                                    <h3 className="text-xl font-bold text-red-700">{restaurant.title}</h3>
                                    <span className="text-xs font-medium text-stone-600">(Clickable)</span>
                                </div>
                                
                                <p className="text-sm text-stone-800 mt-1">
                                    <span className="font-semibold">Location: </span>
                                    {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}
                                </p>
                                <p className="text-sm text-stone-800 mt-1">
                                    <span className="font-semibold">Cuisine: </span>
                                    {restaurant.categories?.join(', ') || 'N/A'}
                                </p>
                                <p className="text-sm text-stone-800 mt-1">
                                    <span className="font-semibold">Price: </span>
                                    {restaurant.price || 'N/A'}
                                </p>

                                <div className="mt-auto pt-3 inline-flex [&_svg]:inline-block">
                                    <Rating 
                                        initialValue={Math.round((restaurant.averageRating || 0) * 2) / 2} 
                                        readonly={true} 
                                        size={20} 
                                        allowFraction={true} 
                                    />
                                    <span className="text-xs text-stone-500 ml-2 mt-1">({restaurant.ratingCount || 0})</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Middle Row: Scrollable Favorites List */}
            <div className="mb-8 bg-white/65 backdrop-blur-md rounded-xl shadow-md border border-white/20 p-6 flex flex-col relative h-auto min-h-[14rem]">
                <h2 className="text-3xl font-bold text-stone-800 text-center mb-6">List of Favorited Restaurants</h2>
                
                {!localStorage.getItem('token') ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-stone-600 mb-4">Log in to view your favorite restaurants!</p>
                        <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl shadow-sm transition-colors">
                            Log In
                        </Link>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-stone-600">You haven't added any favorites yet.</p>
                    </div>
                ) : (
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                        {favorites.map(fav => (
                            <Link 
                                to={`/restaurant/${fav._id}`} 
                                key={fav._id}
                                className="min-w-[200px] sm:min-w-[250px] flex-shrink-0 bg-white/80 rounded-lg shadow-sm border border-white/40 overflow-hidden hover:bg-white transition-colors snap-start"
                            >
                                <img src={fav.imageUrl} alt={fav.title} className="w-full h-32 object-cover" />
                                <div className="p-3">
                                    <h3 className="font-bold text-red-700 truncate">{fav.title}</h3>
                                    <p className="text-xs text-stone-600 truncate">{fav.categories?.join(', ') || 'N/A'}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Row: About Link */}
            <Link 
                to="/about" 
                className="block bg-white/65 backdrop-blur-md rounded-xl shadow-md border border-white/20 p-10 hover:bg-white/80 transition-colors flex items-center justify-center"
            >
                <h2 className="text-3xl font-bold text-stone-800">About Ames Appetites</h2>
            </Link>
        </main>
    );
}

export default Homepage;