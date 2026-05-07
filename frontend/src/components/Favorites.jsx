import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleApiError } from '../utils/handleApiError';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login', { state: { from: '/favorites' } });
                return;
            }

            const res = await fetch('http://ames-appetites-backend.vercel.app/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ message: 'Failed to fetch favorites' }));
                throw { response: { status: res.status, data } };
            }

            const data = await res.json();
            setFavorites(data);
        } catch (err) {
            handleApiError(err, navigate, setError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [navigate]);

    const handleRemoveFavorite = async (restaurantId) => {
        const confirmed = window.confirm("Are you sure you want to remove this restaurant from your favorites?");
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://ames-appetites-backend.vercel.app/api/favorites/${restaurantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ message: 'Failed to remove favorite' }));
                throw { response: { status: res.status, data } };
            }

            setFavorites(prev => prev.filter(fav => fav._id !== restaurantId));
        } catch (err) {
            handleApiError(err, navigate, setError);
        }
    };

    if (loading) {
        return <div className="text-center p-8 text-white text-lg">Loading Favorites...</div>;
    }

    return (
        <main className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-10">
                <h1 className="text-white drop-shadow-md text-center text-5xl font-extrabold tracking-tight">Your Favorites</h1>
            </div>

            {error && (
                <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {favorites.length === 0 && !loading ? (
                <div className="text-center bg-white/65 backdrop-blur-md rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-stone-800">No Favorites Yet!</h2>
                    <p className="text-stone-600 mt-2">You haven't added any restaurants to your favorites. Start exploring!</p>
                    <Link to="/search" className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl shadow-sm transition-colors">
                        Find Restaurants
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((restaurant) => (
                        <div key={restaurant._id} className="bg-white/65 backdrop-blur-md rounded-xl shadow-md border border-white/20 overflow-hidden flex flex-col">
                            <Link to={`/restaurant/${restaurant._id}`} className="block text-stone-900 grow">
                                <img 
                                    src={restaurant.imageUrl} 
                                    alt={restaurant.title} 
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-red-700">{restaurant.title}</h3>
                                    <p className="text-sm text-stone-800 mt-2">
                                        <span className="font-semibold">Cuisine: </span>
                                        {restaurant.categories?.join(', ') || 'N/A'}
                                    </p>
                                    <p className="text-sm text-stone-800">
                                        <span className="font-semibold">Price: </span>
                                        {restaurant.price || 'N/A'}
                                    </p>
                                </div>
                            </Link>
                            <div className="p-4 border-t border-stone-300/50 mt-auto">
                                <button
                                    onClick={() => handleRemoveFavorite(restaurant._id)}
                                    className="w-full bg-stone-700 hover:bg-stone-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default Favorites;