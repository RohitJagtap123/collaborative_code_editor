import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = () => {
        if (!name || !email || !password || !confirmPassword) {
            toast.error('All fields are required!');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        // Simulating successful signup
        toast.success('Account Created Successfully!');
        navigate('/dashboard');
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            handleSignUp();
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
                <img className="w-20 mx-auto mb-4" src="Logo.PNG" alt="App Logo" />
                <h4 className="text-xl font-semibold mb-4">Sign Up and Get Started</h4>
                <div className="space-y-4">
                    <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter Your Name"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        onKeyUp={handleInputEnter}
                    />
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
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="w-full p-2 border rounded-md"
                            placeholder="Confirm Your Password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                            onKeyUp={handleInputEnter}
                        />
                        <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 cursor-pointer">
                            {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </span>
                    </div>
                    <button className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600" onClick={handleSignUp}>
                        Sign Up
                    </button>
                    <span className="text-sm text-gray-600">
                        Already have an account? &nbsp;
                        <a href="/" className="text-blue-500 hover:underline">
                            Log In
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SignUp;