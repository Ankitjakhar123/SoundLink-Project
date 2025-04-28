import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaMusic, FaHeadphones, FaChartLine, FaGlobe } from "react-icons/fa";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white pb-0">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-fuchsia-900/30 to-blue-900/30 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <FaArrowLeft className="mr-2" size={16} />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-fuchsia-500 to-blue-500 bg-clip-text text-transparent">
            About SoundLink
          </h1>
          
          <p className="text-xl text-white/80 max-w-3xl">
            Discover the story behind SoundLink, the premium music streaming platform designed to bring your favorite songs, artists, and playlists together in one seamless experience.
          </p>
        </div>
      </div>
      
      {/* Our Mission */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-fuchsia-500">Our Mission</h2>
            <p className="text-white/80 mb-6 text-lg">
              At SoundLink, we believe music is a universal language that connects people across cultures, geographies, and experiences. Our mission is simple: to create the most personalized and immersive music experience possible.
            </p>
            <p className="text-white/80 text-lg">
              We're passionate about helping listeners discover new artists, rediscover old favorites, and curate the soundtrack to their lives with unprecedented ease and quality.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl shadow-fuchsia-500/10">
            <img 
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" 
              alt="Music studio" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="bg-gradient-to-r from-black to-neutral-900 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose SoundLink?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-fuchsia-500/50 transition-colors">
              <FaHeadphones className="text-fuchsia-500 text-4xl mb-4" />
              <h3 className="text-xl font-bold mb-2">Superior Sound Quality</h3>
              <p className="text-white/70">
                Experience music the way it was meant to be heard with our high-definition audio quality and adaptive streaming.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-fuchsia-500/50 transition-colors">
              <FaMusic className="text-fuchsia-500 text-4xl mb-4" />
              <h3 className="text-xl font-bold mb-2">Personalized Playlists</h3>
              <p className="text-white/70">
                Our AI-driven recommendation system learns your tastes to suggest music you'll love.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-fuchsia-500/50 transition-colors">
              <FaChartLine className="text-fuchsia-500 text-4xl mb-4" />
              <h3 className="text-xl font-bold mb-2">Discover Trending</h3>
              <p className="text-white/70">
                Stay updated with the latest music trends, featured artists, and viral tracks.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-fuchsia-500/50 transition-colors">
              <FaGlobe className="text-fuchsia-500 text-4xl mb-4" />
              <h3 className="text-xl font-bold mb-2">Global Music Library</h3>
              <p className="text-white/70">
                Access millions of songs from around the world, spanning every genre and era.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Story */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
        
        <div className="space-y-8">
          <p className="text-white/80 text-lg text-center max-w-4xl mx-auto">
            SoundLink was founded in 2023 by a group of music enthusiasts and technology innovators who saw an opportunity to revolutionize how people experience music in the digital age.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-2 text-fuchsia-400">2023</h3>
              <p className="text-white/70">
                SoundLink was launched with a vision to create the most user-friendly and personalized music streaming platform.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-2 text-fuchsia-400">Today</h3>
              <p className="text-white/70">
                We're constantly innovating and expanding our library, serving music lovers worldwide with premium features.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-2 text-fuchsia-400">Future</h3>
              <p className="text-white/70">
                Our roadmap includes advanced AI features, expanded artist collaborations, and revolutionary listening experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Section */}
      <div className="bg-black py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-neutral-900 rounded-xl overflow-hidden group">
              <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="CEO" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">Alex Johnson</h3>
                <p className="text-fuchsia-400 mb-3">Founder & CEO</p>
                <p className="text-white/70">
                  With over 15 years in music tech, Alex leads our vision to revolutionize how people experience music.
                </p>
              </div>
            </div>
            
            {/* Team Member 2 */}
            <div className="bg-neutral-900 rounded-xl overflow-hidden group">
              <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80" 
                  alt="CTO" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">Sarah Chen</h3>
                <p className="text-fuchsia-400 mb-3">Chief Technology Officer</p>
                <p className="text-white/70">
                  Sarah brings her expertise in AI and machine learning to create our cutting-edge recommendation system.
                </p>
              </div>
            </div>
            
            {/* Team Member 3 */}
            <div className="bg-neutral-900 rounded-xl overflow-hidden group">
              <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Music Director" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">Michael Torres</h3>
                <p className="text-fuchsia-400 mb-3">Head of Music Partnerships</p>
                <p className="text-white/70">
                  A former record label executive, Michael builds our relationships with artists and music publishers worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Join Us CTA */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Join the SoundLink Community</h2>
        <p className="text-white/80 text-lg max-w-3xl mx-auto mb-8">
          Be part of our growing community of music lovers. Discover, share, and experience music like never before with SoundLink.
        </p>
        
        <Link 
          to="/premium" 
          className="inline-block px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-blue-600 rounded-full text-white font-bold text-lg hover:from-fuchsia-700 hover:to-blue-700 transition-colors"
        >
          Try Premium Today
        </Link>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-black/70 backdrop-blur-sm border-t border-white/10 mt-8 py-10 -mx-4 md:-mx-12 px-4 md:px-12 relative z-10 left-0 right-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-0">
          <div className="text-center">
            <p className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} SoundLink Music Streaming Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About; 