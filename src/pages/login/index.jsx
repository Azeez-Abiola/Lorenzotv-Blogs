import useFetch from "../../hooks/useFetch";
import { Link, useNavigate } from "react-router-dom";
import Form from "./Form";
import lorenzoTvImg2 from "../../assets/lorenTvImage2.png";

const Login = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    error,
    success,
    fetchRequest: fetchUsers,
    clearError,
  } = useFetch();

  if (error.hasError) {
    setTimeout(() => {
      clearError();
    }, 1000);
  }

  const signInHandler = async (formData) => {
    const handleRequestData = (response) => {
      const setCookie = function (value) {
        const expirationDate = new Date();
        expirationDate.setTime(
          expirationDate.getTime() + 10 * 60 * 60 * 1000 // 10 hours
        );
        const cookieString = `jwt=${encodeURIComponent(
          value
        )}; expires=${expirationDate.toUTCString()}; path=/;`;
        document.cookie = cookieString;
      };
      setCookie(response.token);
      localStorage.setItem("loggedInUser", JSON.stringify(response.data.user));
    };
    await fetchUsers(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/auth/signin`,
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
      },
      handleRequestData
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-sans overflow-hidden items-center justify-center">

      <div className="flex w-full max-w-[1600px] h-screen lg:h-[85vh] bg-white rounded-none lg:rounded-[2.5rem] shadow-none lg:shadow-2xl overflow-hidden m-0 lg:m-8 border border-transparent lg:border-white/20">

        {/* Left Columns - Premium Brand Area */}
        <div className="hidden lg:flex w-[45%] bg-[#8C0202] relative flex-col justify-center items-center p-16 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#8C0202] to-[#4a0000] z-0"></div>
          <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-red-600/30 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-black/40 rounded-full blur-[80px]"></div>

          {/* Glass Overlay Texture */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] z-0"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-[320px] mb-12 transform transition-transform hover:scale-105 duration-500">
              <img src={lorenzoTvImg2} alt="Lorenzo Blog" className="w-full object-contain drop-shadow-2xl" />
            </div>

            <h2 className="text-white text-5xl font-black mb-6 tracking-tight leading-tight">
              Welcome <br /> <span className="text-red-200">Back.</span>
            </h2>
            <p className="text-red-100/80 text-lg font-medium max-w-sm leading-relaxed tracking-wide">
              Manage your content, analyze your growth, and inspire the world from your dedicated workspace.
            </p>

            {/* Decor Line */}
            <div className="w-24 h-1.5 bg-red-400/50 rounded-full mt-10"></div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 relative bg-[#FAFAFA] overflow-hidden">

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

          {/* Ambient Glows */}
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-red-100/50 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-gray-200/50 rounded-full blur-[60px] pointer-events-none"></div>

          {/* Mobile Header Logo */}
          <div className="lg:hidden mb-10 w-32 relative z-10">
            <img src={lorenzoTvImg2} alt="Lorenzo Blog" className="w-full drop-shadow-lg filter brightness-0 opacity-80" />
          </div>

          <div className="w-full max-w-[480px] relative z-10">
            {/* Card Container */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 ring-1 ring-gray-100">

              <div className="mb-10 text-center">
                <span className="px-3 py-1 bg-red-50 text-[#8C0202] text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6 inline-block">Admin Portal</span>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tighter leading-tight">
                  Welcome Back
                </h1>
                <p className="text-gray-400 font-medium text-sm md:text-base">Enter your access credentials</p>
              </div>

              <Form
                onSubmit={signInHandler}
                isLoading={isLoading}
                error={error}
                success={success}
              />

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center">
                <Link
                  to="/forgotPassword"
                  className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-[#8C0202] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 text-center">
              <p className="text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
