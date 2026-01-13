import React, { useEffect, useState, useCallback } from 'react'
import Navigation from '../../components/Navigation/Navigation'
import Footer from '../../components/Footer/Footer'
import { Link } from 'react-router-dom'
import useFetch from "../../hooks/useFetch"
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner"
import moment from "moment"
import { AiOutlineArrowRight } from "react-icons/ai"

function Founderseries() {
  const [posts, setPosts] = useState([]);
  const { isLoading, error, fetchRequest: fetchPosts } = useFetch();

  const loadFoundersPosts = useCallback(() => {
    const handleResponse = (response) => {
      setPosts(response.data.blogs);
    };

    const url = `${import.meta.env.VITE_API_BASE_URL}/blogs?tags=Founder's Series&limit=10`;
    fetchPosts({ url }, handleResponse);
  }, [fetchPosts]);

  useEffect(() => {
    loadFoundersPosts();
  }, [loadFoundersPosts]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Header */}
      <section className="pt-48 pb-24 px-8 text-center bg-gray-950 border-b border-white/5 overflow-hidden relative">
        <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
          <div className="inline-block px-4 py-1.5 bg-[#8C0202]/10 border border-[#8C0202]/20 text-[#8C0202] text-[10px] font-black uppercase tracking-[0.3em] rounded-lg mb-8">
            The Masterclass
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8 tracking-tighter">
            Founder’s <span className="text-[#8C0202]">Series</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
            In-depth conversations with visionaries who are reshaping the African landscape.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-[#8C0202] opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>
      </section>

      {/* Founder Content */}
      <main className='py-32 px-8 max-w-7xl mx-auto'>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner type="full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No stories found in this series yet.</p>
          </div>
        ) : (
          <div className='flex flex-col space-y-40'>
            {posts.map((post, idx) => (
              <div key={post.id} className={`flex flex-col md:flex-row items-center gap-16 group ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 w-full">
                  <div className="relative overflow-hidden rounded-[3rem] shadow-2xl transition-all duration-700 group-hover:shadow-[#8C0202]/20 group-hover:-translate-y-4">
                    <img
                      src={post.image_url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop'}
                      alt={post.title}
                      className="w-full aspect-[16/9] object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-10 left-10">
                      <span className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em]">
                        Issue #0{idx + 1}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-[10px] font-black text-[#8C0202] uppercase tracking-[0.3em]">
                      <span>{moment(post.created_at).format('MMMM Do YYYY')}</span>
                      <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                      <span className="text-gray-400">{post.author_name}</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] transition-colors duration-300">
                      {post.title}
                    </h3>
                  </div>

                  <p className="text-gray-500 text-xl leading-relaxed font-medium line-clamp-4">
                    {post.content}
                  </p>

                  <Link to={`/posts/${post.id}`} className="inline-flex items-center space-x-4 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#8C0202] transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-red-200 group/btn">
                    <span>Read Full Series</span>
                    <AiOutlineArrowRight className="transition-transform group-hover/btn:translate-x-2" size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Founderseries;
