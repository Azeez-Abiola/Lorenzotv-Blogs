import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { ValidatePassword, ValidateEmail } from "../../lib/Validations";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Button from "../../components/UI/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { AppContext } from "../../store/AppContext";
import { AiFillEye, AiFillEyeInvisible, AiOutlineMail, AiOutlineLock } from "react-icons/ai";

const Form = ({ onSubmit, error, isLoading, success }) => {
  const navigate = useNavigate();
  const { updateLoggedInState } = useContext(AppContext);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    emailIsValid: true, // Default true to avoid red error on load
    passwordIsValid: true,
  });
  const [isTouched, setIsTouched] = useState({
    email: false,
    password: false
  });

  // Handle Toast Errors
  useEffect(() => {
    if (!isLoading && error.hasError) {
      toast.warn(`Login failed! - ${error.message}`, {
        position: "top-right", theme: "dark"
      });
    }
  }, [isLoading, error]);

  // Handle Success
  useEffect(() => {
    if (success && !isLoading && !error.hasError) {
      toast.success("Login successful. Redirecting...", {
        position: "top-right", theme: "dark"
      });
      const timer = setTimeout(() => {
        updateLoggedInState(true);
        navigate("/admin");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [success, isLoading, error, updateLoggedInState, navigate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Validate immediately on change
    if (name === 'email') {
      setIsTouched(prev => ({ ...prev, email: true }));
      setForm(prev => ({ ...prev, emailIsValid: ValidateEmail(value) }));
    }
    if (name === 'password') {
      setIsTouched(prev => ({ ...prev, password: true }));
      setForm(prev => ({ ...prev, passwordIsValid: ValidatePassword(value) }));
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();

    const emailValid = ValidateEmail(form.email);
    const passValid = ValidatePassword(form.password);

    setForm(prev => ({
      ...prev,
      emailIsValid: emailValid,
      passwordIsValid: passValid
    }));
    setIsTouched({ email: true, password: true });

    if (!emailValid || !passValid) return;

    // Send form details to parent component
    onSubmit({
      email: form.email,
      password: form.password,
    });
  };

  return (
    <form className='w-full space-y-6' onSubmit={submitHandler}>
      <div className="space-y-5">
        {/* Email Input */}
        <div className="relative group">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8C0202] transition-colors">
              <AiOutlineMail className="text-xl" />
            </div>
            <input
              id="email"
              name="email"
              type="text"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-medium text-gray-800 placeholder:text-gray-300
                      ${isTouched.email && !form.emailIsValid
                  ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                  : 'border-transparent focus:border-[#8C0202]/20 focus:bg-white hover:bg-gray-100'}`}
            />
          </div>
          {isTouched.email && !form.emailIsValid && (
            <p className="text-red-500 text-xs mt-2 ml-1 font-bold flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span> Invalid email address
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="relative group">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8C0202] transition-colors">
              <AiOutlineLock className="text-xl" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-medium text-gray-800 placeholder:text-gray-300
                      ${isTouched.password && !form.passwordIsValid
                  ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                  : 'border-transparent focus:border-[#8C0202]/20 focus:bg-white hover:bg-gray-100'}`}
            />
            <div
              className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-[#8C0202] transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiFillEyeInvisible className="text-2xl" /> : <AiFillEye className="text-2xl" />}
            </div>
          </div>
          {isTouched.password && !form.passwordIsValid && (
            <p className="text-red-500 text-xs mt-2 ml-1 font-bold flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span> Password requirements not met
            </p>
          )}
        </div>
      </div>

      <div className="pt-4">
        {isLoading ? (
          <div className="flex justify-center p-4"><LoadingSpinner /></div>
        ) : (
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#8C0202] to-[#600000] hover:from-[#a00000] hover:to-[#8C0202] text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-[#8C0202]/20 hover:shadow-2xl hover:shadow-[#8C0202]/40 transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 ease-out uppercase tracking-widest text-xs"
          >
            Sign In to Dashboard
          </button>
        )}
      </div>

      {/* Toasts */}
      {(!isLoading && (error.hasError || success)) && (
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      )}
    </form>
  );
};
export default Form;
