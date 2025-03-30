import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
        toast.error("All fields are required!");
        return;
    }

    setLoading(true);

    try {
        const BACKEND = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.post(`${BACKEND}/api/login`, {
            email,
            password
        });

        if (response.data.success) {
            localStorage.setItem("token", response.data.token);
            toast.success("Logged In Successfully!");
            navigate("/dashboard");
        } else {
            toast.error(response.data.message);
        }
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || "Login failed!");
        }
    } finally {
        setLoading(false);
    }
};


  const handleInputEnter = (e: { code: string; }) => {
    if (e.code === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Floating Gradient Blur Effect */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-blue-500 opacity-30 rounded-full filter blur-3xl top-20 left-10 animate-pulse"></div>
        <div className="absolute w-80 h-80 bg-purple-500 opacity-30 rounded-full filter blur-3xl bottom-10 right-20 animate-pulse"></div>
      </div>

      {/* Login Card */}
      <motion.div
        className="bg-gray-950 p-8 rounded-2xl shadow-2xl w-96 text-center z-10 border border-gray-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img className="w-24 mx-auto mb-4" src="Logo.PNG" alt="App Logo" />
        <h4 className="text-2xl font-semibold mb-6 text-blue-400">
          Login to Your Account
        </h4>

        <div className="space-y-5">
          <input
            type="email"
            className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter Your Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            onKeyUp={handleInputEnter}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter Your Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              onKeyUp={handleInputEnter}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          <motion.button
            className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-400 transition-all shadow-md disabled:bg-gray-600"
            onClick={handleLogin}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Logging in..." : "Log In"}
          </motion.button>

          <p className="text-10px text-gray-400">
            Forgot Password
            <a
              href="/forgot-password"
              className="text-blue-400 hover:underline hover:text-blue-300"
            >
              &nbsp;Click Here
            </a>
          </p>

          <p className="text-10px text-gray-400">
            Don't have an account? &nbsp;
            <a
              href="/signup"
              className="text-blue-400 hover:underline hover:text-blue-300"
            >
              Sign Up
            </a>
          </p>
        </div>
      </motion.div>

      {/* Animated Wave Effect */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900 via-black to-transparent"></div>

      {/* Footer */}
      <footer className="absolute bottom-5 text-gray-400 text-sm z-10">
        <p>&copy; 2025 CodeIt. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
