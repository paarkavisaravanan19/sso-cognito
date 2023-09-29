import Image from "../../assets/loginimage.png";

const Login = () => {
  const handleLogin = () => {
    window.location.href = import.meta.env.VITE_COGNITO_SSO;
  };

  return (
      <div className=" bg-white h-[56rem] p-0 pr-0 flex max-h-screen">
        <div className="flex-grow hidden lg:block  bg-no-repeat h-full bg-cover w-1/2"
          style={{ backgroundImage: `url(${Image})` }}></div>

        <div className="flex-grow w-1/2 flex flex-col justify-center items-center">
          <h1 className="text-center">Welcome to Retro Revive</h1>
          <p className="p-2 text-xl text-center">Login with your Presidio Credentials to get started </p>
          <button
            className="mt-10 p-2 text-white bg-[#007EBA] rounded-lg pl-12 pr-12 text-2xl"
            onClick={handleLogin}>Login with SSO
          </button>
        </div>
      </div>
    
  );
};

export default Login;
