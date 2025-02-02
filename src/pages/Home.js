import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    
    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('New Room Created Successfully!');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('Both Room ID and Username are required!');
            return;
        }
        if (roomId.length !== 36) {
            toast.error('Invalid Room ID format');
            setIsRoomIdValid(false);
            return;
        }

        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <img
                    className="homePageLogo"
                    src="Logo.PNG"
                    alt="App Logo"
                />
                <h4 className="mainLabel">Collaborate Seamlessly with Coders</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className={`inputBox ${!isRoomIdValid ? 'inputError' : ''}`}
                        placeholder="Enter Room ID"
                        onChange={(e) => {
                            setRoomId(e.target.value);
                            setIsRoomIdValid(true);
                        }}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="Enter Your Username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join Room
                    </button>
                    <span className="createInfo">
                        Don’t have a Room? &nbsp;
                        <a
                            onClick={createNewRoom}
                            href=""
                            className="createNewBtn"
                        >
                            Create One
                        </a>
                    </span>
                </div>
            </div>
            {/* <footer>
                <h4>
                    Built by &nbsp;
                    <a href="https://github.com/RohitJagtap123">Rohit Jagtap</a>
                </h4>
            </footer> */}
        </div>
    );
};

export default Home;
