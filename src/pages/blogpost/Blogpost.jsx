import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';
import Footer from '../../components/Footer/Footer';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { CiHeart } from "react-icons/ci";
import { IoMdHeart } from "react-icons/io";
import { TfiComment } from "react-icons/tfi";
import { Resentpost } from '../../components/smallComponents/Smallcomponents';
import useFetch from '../../hooks/useFetch';
import moment from "moment";
import { toast } from 'react-toastify';

const Blogpost = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [like, setLike] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { fetchRequest, isLoading } = useFetch();

  // Check if user is logged in
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
  };
  const isLoggedIn = !!getCookie('jwt');

  const fetchPostData = useCallback(() => {
    // Fetch Blog
    fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/blogs/${postId}` }, (res) => {
      if (res.status === 'success') {
        const blogData = res.data.blog;
        setPost(blogData);
        setLikesCount(Math.floor(Math.random() * 200) + 50); // Mock likes
      }
    });

    // Fetch Comments
    fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/blogs/${postId}/comments` }, (res) => {
      if (res.status === 'success') {
        setComments(res.data.comments || []);
      }
    });
  }, [fetchRequest, postId]);

  useEffect(() => {
    fetchPostData();
    window.scrollTo(0, 0);
  }, [fetchPostData]);

  const handleLike = () => {
    setLike(!like);
    setLikesCount(prev => like ? prev - 1 : prev + 1);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    setIsSubmittingComment(true);

    try {
      // Get token if user is logged in (optional)
      const token = getCookie('jwt');
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add authorization if token exists
      if (token) {
        try {
          headers['Authorization'] = `Bearer ${decodeURIComponent(token)}`;
        } catch (e) {
          // Invalid token, continue as guest
        }
      }

      await fetchRequest({
        url: `${import.meta.env.VITE_API_BASE_URL}/blogs/${postId}/comments`,
        method: 'POST',
        body: {
          content: commentContent,
          author_name: 'Guest'
        },
        headers
      }, (res) => {
        if (res.status === 'success') {
          toast.success("Comment posted!");
          setCommentContent("");
          // Refresh comments
          fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/blogs/${postId}/comments` }, (refreshRes) => {
            if (refreshRes.status === 'success') setComments(refreshRes.data.comments || []);
          });
        }
      });
    } catch (error) {
      toast.error("Failed to post comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading && !post) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex justify-center items-center h-[70vh]">
          <LoadingSpinner type="full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex flex-col justify-center items-center h-[70vh] text-center px-6">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Story Not Found</h1>
          <p className="text-gray-400 font-medium">The article you are looking for doesn't exist or has been removed.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white font-sans'>
      <Navigation />

      {/* Article Header */}
      <div className="max-w-4xl mx-auto pt-40 px-6">
        <div className="flex items-center space-x-3 mb-6">
          <span className="px-3 py-1 bg-red-50 text-[#8C0202] text-[10px] font-extrabold uppercase tracking-widest rounded-lg">
            {Array.isArray(post.tags) ? post.tags[0] : (post.tags || "General")}
          </span>
          <span className="text-gray-300 text-xs">•</span>
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            {moment(post.created_at).format('MMM D, YYYY')}
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-8">
          {post.title}
        </h1>

        <div className="flex items-center justify-between pb-8 border-b border-gray-100 mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-2xl overflow-hidden shadow-sm border-2 border-white">
              {post.profiles?.avatar_url ?
                <img src={post.profiles.avatar_url} alt="Author" className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-lg">{post.profiles?.username?.[0] || 'A'}</div>
              }
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{post.profiles?.username || "Lorenzo Editor"}</p>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                Author
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all border
                            ${like ? 'bg-red-50 border-red-100 text-[#8C0202]' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
            >
              {like ? <IoMdHeart size={18} /> : <CiHeart size={18} />}
              <span className="text-xs font-bold">{likesCount}</span>
            </button>
            <a href="#comments" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-[#8C0202] transition-all">
              <TfiComment size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      {post.image_url && (
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <img className='w-full h-[60vh] object-cover rounded-[3rem] shadow-2xl shadow-black/10' src={post.image_url} alt="Featured" />
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 mb-24">
        <div
          className='text-gray-800 text-lg leading-[1.8] space-y-8 prose prose-lg prose-red max-w-none prose-img:rounded-3xl prose-headings:font-black prose-a:text-[#8C0202]'
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-3">
          {(Array.isArray(post.tags) ? post.tags : [post.tags]).map(tag => tag && (
            <span key={tag} className="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs font-bold text-gray-500 hover:bg-[#8C0202] hover:text-white hover:border-[#8C0202] transition-all cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      </article>

      {/* Comments Section */}
      <section id="comments" className='bg-[#FAFAFA] py-24 px-6 border-t border-gray-100'>
        <div className='max-w-3xl mx-auto'>
          <div className="flex items-center justify-between mb-12">
            <h3 className='text-2xl font-bold text-gray-900 tracking-tight'>Discussion <span className="text-gray-400 font-medium ml-2 text-lg">{comments.length}</span></h3>
          </div>

          <div className='space-y-12'>
            {/* Comment Form */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              {isLoggedIn ? (
                <form onSubmit={handlePostComment}>
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-[#8C0202] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      You
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full h-32 p-4 bg-gray-50 border-none rounded-2xl resize-none focus:ring-2 focus:ring-[#8C0202]/10 focus:bg-white transition-all text-sm font-medium"
                      />
                      <div className="flex justify-end mt-4">
                        <button
                          type="submit"
                          disabled={isSubmittingComment || !commentContent.trim()}
                          className="px-8 py-3 bg-[#1C1D36] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#8C0202] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 font-medium mb-4">Please log in to join the conversation.</p>
                  <Link to="/login" className="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#8C0202] transition-colors">
                    Log In / Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-8">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="flex space-x-4 animate-fade-in group">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 font-bold overflow-hidden shrink-0 border border-gray-100">
                      {comment.profiles?.avatar_url ? (
                        <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        comment.profiles?.username?.[0] || 'G'
                      )}
                    </div>
                    <div className="flex-1 bg-white p-6 rounded-2xl rounded-tl-none border border-gray-100/50 shadow-sm group-hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-bold text-gray-900">{comment.profiles?.username || 'Guest'}</h5>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{moment(comment.created_at).fromNow()}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center italic text-gray-400 font-medium">
                  No comments yet. Be the first to start the conversation!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended */}
      <div className="py-24 max-w-7xl mx-auto px-6">
        <h3 className="text-xl font-bold text-gray-900 mb-10">You may also like</h3>
        <Resentpost />
      </div>

      <Footer />
    </div>
  )
}

export default Blogpost;
