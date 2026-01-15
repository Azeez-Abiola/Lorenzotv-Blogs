import { useContext, useState } from "react";
import { AppContext } from "../../store/AppContext";
import { FaTimes, FaEnvelope, FaCheckCircle } from "react-icons/fa";

const NewsletterModal = () => {
    const { showNewsletterModal, setShowNewsletterModal } = useContext(AppContext);
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    if (!showNewsletterModal) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            setTimeout(() => {
                setShowNewsletterModal(false);
                setIsSubscribed(false);
                setEmail("");
            }, 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden relative shadow-2xl animate-scale-up">
                <button
                    onClick={() => setShowNewsletterModal(false)}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <FaTimes size={24} />
                </button>

                <div className="p-12 text-center">
                    {isSubscribed ? (
                        <div className="py-12 animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCheckCircle size={40} />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-2 font-black tracking-tight">You're In!</h3>
                            <p className="text-gray-500 font-medium">Thank you for subscribing to our newsletter.</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-[#8C0202]/10 text-[#8C0202] rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                                <FaEnvelope size={32} />
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Join the Series</h3>
                            <p className="text-gray-500 font-medium mb-12">Get the latest stories, insights, and updates from LorenzoTV delivered directly to your inbox. No spam, ever.</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#8C0202] focus:bg-white transition-all text-gray-900 font-medium shadow-inner"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-[#8C0202] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-red-950/20 hover:bg-[#6b0202] hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    Subscribe Now
                                </button>
                            </form>
                            <p className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">By subscribing, you agree to our Privacy Policy</p>
                        </>
                    )}
                </div>

                {/* Decor */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#8C0202] via-red-500 to-[#8C0202]"></div>
            </div>
        </div>
    );
};

export default NewsletterModal;
