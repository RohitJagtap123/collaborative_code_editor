import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        if (!email || !password) {
            toast.error('All fields are required!');
            return;
        }

        // Simulating successful login
        toast.success('Logged In Successfully!');
        navigate('/dashboard');
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
                <img className="w-20 mx-auto mb-4" src="Logo.PNG" alt="App Logo" />
                <h4 className="text-xl font-semibold mb-4">Login to Your Account</h4>
                <div className="space-y-4">
                    <input
                        type="email"
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter Your Email"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        onKeyUp={handleInputEnter}
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter Your Password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            onKeyUp={handleInputEnter}
                        />
                        <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 cursor-pointer">
                            {showPassword ? <EyeOff /> : <Eye />}
                        </span>
                    </div>
                    <button className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600" onClick={handleLogin}>
                        Log In
                    </button>
                    <span className="text-sm text-gray-600">
                        Don't have an account? &nbsp;
                        <a href="/signup" className="text-blue-500 hover:underline">
                            Sign Up
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
