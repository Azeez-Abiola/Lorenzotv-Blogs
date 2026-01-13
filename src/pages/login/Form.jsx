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
      <div className="space-y-4">
        {/* Email Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8C0202] transition-colors">
            <AiOutlineMail className="text-xl" />
          </div>
          <input
            id="email"
            name="email"
            type="text"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 bg-gray-50 border-2 rounded-xl outline-none transition-all font-medium text-gray-700
                    ${isTouched.email && !form.emailIsValid
                ? 'border-red-400 focus:border-red-500 bg-red-50'
                : 'border-transparent focus:border-[#8C0202] focus:bg-white hover:bg-white hover:border-gray-200'}`}
          />
          {isTouched.email && !form.emailIsValid && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-medium">Please provide a valid email.</p>
          )}
        </div>

        {/* Password Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8C0202] transition-colors">
            <AiOutlineLock className="text-xl" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={`w-full pl-10 pr-12 py-3 bg-gray-50 border-2 rounded-xl outline-none transition-all font-medium text-gray-700
                    ${isTouched.password && !form.passwordIsValid
                ? 'border-red-400 focus:border-red-500 bg-red-50'
                : 'border-transparent focus:border-[#8C0202] focus:bg-white hover:bg-white hover:border-gray-200'}`}
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <AiFillEyeInvisible className="text-xl" /> : <AiFillEye className="text-xl" />}
          </div>
          {isTouched.password && !form.passwordIsValid && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-medium">Min 8 chars, uppercase, lowercase, number.</p>
          )}
        </div>
      </div>

      <div className="pt-2">
        {isLoading ? (
          <div className="flex justify-center"><LoadingSpinner /></div>
        ) : (
          <button
            type="submit"
            className="w-full bg-[#8C0202] hover:bg-[#6b0202] text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out uppercase tracking-wide text-sm"
          >
            Login
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
          theme="dark"
        />
      )}
    </form>
  );
};
export default Form;
