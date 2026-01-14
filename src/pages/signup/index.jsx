import { Link, Outlet, useNavigate } from "react-router-dom";
import lorenzoTvImg from "../../assets/lorenzoTVImg.png";
import useFetch from "../../hooks/useFetch";

import Form from "./Form";
import classes from "./SignUp.module.css";
import logo from "../../assets/renzologo.png";

const SignUp = () => {
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
    }, 2000);
  }
  const signUpHandler = async (formData) => {
    await fetchUsers({
      url: `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  return (
    <>
      <Outlet />
      <div className='flex items-center bg-[#b91c1c] overflow-hidden h-screen'>
        {/* <div className={classes.bg}>
          <img src={lorenzoTvImg} alt="lorenzoBlog img" />
          <div><p className="text-white text-[20px] text-center font-[700] mt-4">create an account and become part of this space</p></div>
        </div> */}
        <div className="w-[50%] hidden lg:flex md:flex flex-col justify-center space-y-[2rem] overflow-hidden">
          <img src={lorenzoTvImg} className="w-[77%]" alt="lorenzoBlog img" />
          <div><p className="text-white text-[20px] text-center font-[700] mt-4">Join Us On The Journey Of Ideas And Discovery</p></div>
        </div>
        <div className={`${classes.formBg} h-screen overflow-y-auto overflow-x-hidden w-[100%] md:w-[50%] lg:w-[50%] rounded-bl-none rounded-tl-none lg:rounded-l-[61px] md:rounded-l-[61px]`}>
          <div className='text-center mb-[]'>
            <h1 className="font-[800] text-[35px]">Sign Up</h1>
          </div>
          <Form
            onSubmit={signUpHandler}
            isLoading={isLoading}
            error={error}
            success={success}
          />
          <p className={classes.p}>
            Already have an account?
            <Link to="/login" className={classes.a}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;
