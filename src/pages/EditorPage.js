import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import '../App.css';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const terminalRef = useRef(null);
    const [clients, setClients] = useState([]);
    const [isTerminalOpen, setTerminalOpen] = useState(false);
    const [language, setLanguage] = useState('');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const[isOutputAreaVisible,setIsOutputAreaVisible]=useState(false);

    // Mapping for Judge0 language IDs
    const languageMapping = {
        cpp: 54,
        javascript: 63, // JavaScript (Node.js)
        python: 71,     // Python 3
        java: 62,        // Java (OpenJDK)
        
    };

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', handleErrors);
            socketRef.current.on('connect_failed', handleErrors);

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                }
                setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            });

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => prev.filter((client) => client.socketId !== socketId));
            });
        };
        init();

        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, [reactNavigator, roomId, location.state?.username]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (terminalRef.current && !terminalRef.current.contains(event.target) && isTerminalOpen) {
                setTerminalOpen(false);
                setIsOutputAreaVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isTerminalOpen]);

    const runCode = async () => {
        //
        setIsLoading(true);

        if (!language) {
            toast.error('Please select a language.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/run-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language_id: languageMapping[language],
                    // source_code: btoa(codeRef.current), // Base64 encoding
                    // stdin: btoa(input),
                    source_code: codeRef.current, // Send as plain text, no base64 encoding
                    stdin: input
                }),
            });

            const data = await response.json();

            if (response.ok) {
                pollForOutput(data.token);
            } else {
                toast.error(data.error || 'Failed to execute code.');
                setOutput(data.error);
                setIsLoading(false);
            }
        } catch (err) {
            toast.error('Failed to execute the code.');
            console.error(err);
            setIsLoading(false);
        }
        
    };

    const pollForOutput = async (token) => {
        // setIsOutputAreaVisible(true);

        try {
            const response = await fetch(`http://localhost:5000/api/get-output/${token}`);
            const data = await response.json();
            if (data.status === 'Processing') {
                setTimeout(() => pollForOutput(token), 2000); // Retry polling after 2 seconds
            } else {
                setIsOutputAreaVisible(true);
                setOutput(data.output);
                setIsLoading(false);
            }
        } catch (err) {
            toast.error('Failed to fetch the output.');
            console.error(err);
            setIsLoading(false);
        }
    };

    if (!location.state) {
        return <Navigate to="/" />;
    }  

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        {/* <img className="logoImage" src="/Logo.PNG" alt="logo" /> */}
                        <h3>Lets's Code</h3>
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>
                <button className="copybtn" onClick={() => navigator.clipboard.writeText(roomId)}>
                    Copy ROOM ID
                </button>
                <button className="leavebtn" onClick={() => reactNavigator('/dashboard')}>
                    Leave
                </button>
            </div>
            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
                <button
                    className="runBtn"
                    onClick={() => setTerminalOpen(!isTerminalOpen)}
                    style={{ position: 'absolute', right: '10px', top: '10px' }}
                >
                    Run
                </button>
            </div>
            {isTerminalOpen && (
                <div className="terminal" ref={terminalRef}>
                    <h3>Run Code</h3>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="languageSelector"
                    >
                        <option value="">Select Language</option>
                        <option value="cpp">C++</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                    </select>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter input"
                        className="inputArea"
                    ></textarea>
                    <button onClick={runCode} disabled={isLoading} className="executeBtn">
                        {isLoading? 'Executing...' :'Execute'}
                    </button>

                    {/* {isLoading ?(
                        <div className="spinner"></div>
                    ) :(


                        {isOutputAreaVisible && (
                        <div className="outputArea">
                        <h3>Output:</h3>
                        <pre>{output}</pre>
                        </div>

                        )}

                    )
                
                    } */}

                    {isLoading ? (
                     <div className="spinner"></div>
                     ) : (
                        isOutputAreaVisible && (
                            <div className="outputArea">
                                <h3>Output:</h3>
                                <pre>{output}</pre>
                            </div>
                         )
                     )}

                    
                </div>
            )}
        </div>
    );
};

export default EditorPage;











