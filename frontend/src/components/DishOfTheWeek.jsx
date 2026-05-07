import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleApiError } from '../utils/handleApiError';

const DishOfTheWeek = () => {
    const [dishOfWeek, setDishOfWeek] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDishOfTheWeek = async () => {
            try {
                setLoading(true);
                setError('');
                // Assuming an endpoint to get the dish of the week restaurant
                const res = await fetch('https://ames-appetites-backend.vercel.app/api/restaurants/dotw');
                
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('No dish of the week has been set.');
                    }
                    const data = await res.json().catch(() => ({ message: 'Failed to fetch dish of the week' }));
                    throw {
                        response: {
                            status: res.status,
                            data,
                        }
                    };
                }

                const data = await res.json();
                setDishOfWeek(data);
            } catch (err) {
                if (err.message === 'No dish of the week has been set.') {
                    setError(err.message);
                } else {
                    handleApiError(err, navigate, setError);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDishOfTheWeek();
    }, [navigate]);

    if (loading) {
        return <div className="text-center p-8 text-white text-lg">Loading Dish of the Week...</div>;
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-12 text-center">
                <div className="bg-white/65 backdrop-blur-md rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Oh no!</h2>
                    <p className="text-stone-800">{error}</p>
                </div>
            </div>
        );
    }

    if (!dishOfWeek) {
        return (
             <div className="max-w-5xl mx-auto px-6 py-12 text-center">
                <div className="bg-white/65 backdrop-blur-md rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Check Back Later!</h2>
                    <p className="text-stone-800">No dish of the week is featured right now.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col min-h-[calc(100vh-80px)]">
            {/* Page Header */}
            <div className="mb-12 text-center">
                <h1 className="text-white drop-shadow-md text-5xl font-extrabold tracking-tight">Dish of The Week</h1>
                <p className="text-white/80 mt-2 text-lg">Our featured dish, curated just for you!</p>
            </div>

            {/* Dish of the Week Card */}
            <div className="bg-white/65 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-1/2">
                    <img 
                        src={dishOfWeek.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'} 
                        alt={dishOfWeek.specialtyDish} 
                        className="w-full h-64 md:h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="p-8 md:w-1/2 flex flex-col justify-center">
                    <h3 className="text-sm uppercase text-red-700 font-semibold tracking-wider">{dishOfWeek.title}</h3>
                    <h2 className="text-4xl font-bold text-stone-900 mt-2 mb-4">{dishOfWeek.specialtyDish}</h2>
                    <p className="text-stone-800 mb-6 leading-relaxed">
                        {dishOfWeek.description || 'No description available for this amazing dish, but we promise it\'s great!'}
                    </p>
                    
                    <div className="mt-auto">
                        <Link 
                            to={`/restaurant/${dishOfWeek._id}`}
                            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-sm transition-colors duration-300 text-center"
                        >
                            View Restaurant & Reviews
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default DishOfTheWeek;


