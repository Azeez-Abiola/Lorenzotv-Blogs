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
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
      {/* Left Columns - Red Background */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#8C0202] to-[#5a0000] flex-col justify-center items-center relative p-12 overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-black opacity-10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="z-10 flex flex-col items-center animate-fade-in-up">
          <div className="w-[300px] mb-8 drop-shadow-2xl">
            <img src={lorenzoTvImg2} alt="Lorenzo TV" className="w-full object-contain" />
          </div>
          <h2 className="text-white text-3xl font-bold text-center mb-4 tracking-wide">Welcome Back!</h2>
          <p className="text-white/80 text-lg text-center font-medium max-w-md leading-relaxed">
            Join us on the journey of ideas and discovery.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative bg-gray-50">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden mb-8 w-32">
          <img src={lorenzoTvImg2} alt="Lorenzo TV" className="w-full" />
        </div>

        {/* Increased width from max-w-md to max-w-xl as requested */}
        <div className="w-full max-w-xl bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-sm">
          <div className="text-center mb-10">
            <h1 className="font-extrabold text-4xl text-gray-800 mb-2">Login</h1>
            <p className="text-gray-500">Sign in to your admin account</p>
          </div>

          <Form
            onSubmit={signInHandler}
            isLoading={isLoading}
            error={error}
            success={success}
          />

          <div className="mt-8 flex items-center justify-between text-sm">
            <Link to="/forgotPassword" className="text-[#8C0202] hover:text-[#600000] font-semibold transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="mt-8 text-gray-400 text-xs">
          © {new Date().getFullYear()} Lorenzo TV Media. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
