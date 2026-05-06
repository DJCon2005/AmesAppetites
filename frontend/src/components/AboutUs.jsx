import { Link } from 'react-router-dom';
import React from 'react';
import bhImage from '../assets/BH.webp';
import dcImage from '../assets/DC.jpg';

const AboutUs = () => {
    return (
        <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col min-h-[calc(100vh-80px)]">
            
            {/* Page Header */}
            <div className="mb-12">
                <h1 className="text-white drop-shadow-md text-center text-5xl font-extrabold tracking-tight">About Us</h1>
            </div>

            {/* Profile Cards Container */}
            <div className="grid md:grid-cols-2 gap-10 grow">
                
                {/* Profile Card: Ben Hurley */}
                <div className="bg-white/65 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
                    <img 
                        src={bhImage} 
                        alt="Picture of Ben Hurley" 
                        className="w-48 h-48 rounded-full object-cover shadow-md mb-6 border-4 border-white/50"
                    />
                    <h2 className="text-3xl font-bold text-red-700 mb-4">Ben Hurley</h2>
                    <p className="text-stone-800 mb-6 leading-relaxed grow">
                        Hi, my name is Ben, I am a sophomore in software engineering here at ISU, I am minoring in AI/Machine Learning, AI Human Interaction, and Cybersecurity. I enjoy coding in many languages such as Java, C++, Lua, and this semester I am learning HTML/CSS and JS in COMS3190.
                    </p>
                    
                    <div className="w-full border-t border-stone-400/30 pt-6 space-y-4">
                        <p className="text-stone-800 font-medium">
                            Email: <a href="mailto:bfhurley@iastate.edu" className="text-red-700 hover:text-red-800 hover:underline transition-all">bfhurley@iastate.edu</a>
                        </p>
                        <a 
                            href="https://github.com/ItsBentacular/IowaStateProjects" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl shadow-sm transition-colors"
                        >
                            GitHub Page
                        </a>
                    </div>
                </div>

                {/* Profile Card: Dillon Conrad */}
                <div className="bg-white/65 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
                    <img 
                        src={dcImage} 
                        alt="Picture of Dillon Conrad" 
                        className="w-48 h-48 rounded-full object-cover shadow-md mb-6 border-4 border-white/50"
                    />
                    <h2 className="text-3xl font-bold text-red-700 mb-4">Dillon Conrad</h2>
                    <p className="text-stone-800 mb-6 leading-relaxed grow">
                        Hi, my name is Dillon, I'm a sophomore majoring in Software Engineering at Iowa State University. I am also minoring in Agriculture Systems Technology. I'm passionate about building software programs that have a practical use in the real world. In my free time, I enjoy playing video games, reading, and spending time with friends and family.
                    </p>

                    <div className="w-full border-t border-stone-400/30 pt-6 space-y-4">
                        <p className="text-stone-800 font-medium">
                            Email: <a href="mailto:djcon19@iastate.edu" className="text-red-700 hover:text-red-800 hover:underline transition-all">djcon19@iastate.edu</a>
                        </p>
                        <a 
                            href="https://www.linkedin.com/in/dillon-conrad05" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block bg-stone-800 hover:bg-stone-900 text-white font-semibold py-2 px-6 rounded-xl shadow-sm transition-colors"
                        >
                            LinkedIn Page
                        </a>
                    </div>
                </div>

            </div>
        </main>
    );
};

export default AboutUs;