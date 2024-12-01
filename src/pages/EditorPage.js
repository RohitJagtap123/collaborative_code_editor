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
    const codeRef = useRef('');
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const terminalRef = useRef(null);
    const [clients, setClients] = useState([]);
    const [isTerminalOpen, setTerminalOpen] = useState(false);
    const [language, setLanguage] = useState('');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

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
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isTerminalOpen]);

    const runCode = async () => {
        if (!language) {
            toast.error('Please select a language.');
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
            }
        } catch (err) {
            toast.error('Failed to execute the code.');
            console.error(err);
        }
    };

    const pollForOutput = async (token) => {
        try {
            const response = await fetch(`http://localhost:5000/api/get-output/${token}`);
            const data = await response.json();
            if (data.status === 'Processing') {
                setTimeout(() => pollForOutput(token), 2000); // Retry polling after 2 seconds
            } else {
                setOutput(data.output);
            }
        } catch (err) {
            toast.error('Failed to fetch the output.');
            console.error(err);
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
                        <img className="logoImage" src="/code-sync.png" alt="logo" />
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
                <button className="leavebtn" onClick={() => reactNavigator('/')}>
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
                    <button onClick={runCode} className="executeBtn">
                        Execute
                    </button>
                    <div className="outputArea">
                        <h4>Output:</h4>
                        <pre>{output}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorPage;















// import React, { useState, useRef, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import '../App.css';

// import ACTIONS from '../Actions';
// import Client from '../components/Client';
// import Editor from '../components/Editor';
// import { initSocket } from '../socket';
// import {
//     useLocation,
//     useNavigate,
//     Navigate,
//     useParams,
// } from 'react-router-dom';

// const EditorPage = () => {
//     const socketRef = useRef(null);
//     const codeRef = useRef(null);
//     const location = useLocation();
//     const { roomId } = useParams();
//     const reactNavigator = useNavigate();
//     const [clients, setClients] = useState([]);

//     useEffect(() => {
//         const init = async () => {
//             socketRef.current = await initSocket();
//             socketRef.current.on('connect_error', (err) => handleErrors(err));
//             socketRef.current.on('connect_failed', (err) => handleErrors(err));

//             function handleErrors(e) {
//                 console.log('socket error', e);
//                 toast.error('Socket connection failed, try again later.');
//                 reactNavigator('/');
//             }

//             socketRef.current.emit(ACTIONS.JOIN, {
//                 roomId,
//                 username: location.state?.username,
//             });

//             // Listening for joined event
//             socketRef.current.on(
//                 ACTIONS.JOINED,
//                 ({ clients, username, socketId }) => {
//                     if (username !== location.state?.username) {
//                         toast.success(`${username} joined the room.`);
//                         console.log(`${username} joined`);
//                     }
//                     setClients(clients);
//                     socketRef.current.emit(ACTIONS.SYNC_CODE, {
//                         code: codeRef.current,
//                         socketId,
//                     });
//                 }
//             );

//             // Listening for disconnected
//             socketRef.current.on(
//                 ACTIONS.DISCONNECTED,
//                 ({ socketId, username }) => {
//                     toast.success(`${username} left the room.`);
//                     setClients((prev) => {
//                         return prev.filter(
//                             (client) => client.socketId !== socketId
//                         );
//                     });
//                 }
//             );
//         };
//         init();
//         return () => {
//             socketRef.current.disconnect();
//             socketRef.current.off(ACTIONS.JOINED);
//             socketRef.current.off(ACTIONS.DISCONNECTED);
//         };
//     }, []);

//     async function copyRoomId() {
//         try {
//             await navigator.clipboard.writeText(roomId);
//             toast.success('Room ID has been copied to your clipboard');
//         } catch (err) {
//             toast.error('Could not copy the Room ID');
//             console.error(err);
//         }
//     }

//     function leaveRoom() {
//         reactNavigator('/');
//     }

//     if (!location.state) {
//         return <Navigate to="/" />;
//     }

//     return (
//         <div className="mainWrap">
//             <div className="aside">
//                 <div className="asideInner">
//                     <div className="logo">
//                         <img
//                             className="logoImage"
//                             src="/code-sync.png"
//                             alt="logo"
//                         />
//                     </div>
//                     <h3>Connected</h3>
//                     <div className="clientsList">
//                         {clients.map((client) => (
//                             <Client
//                                 key={client.socketId}
//                                 username={client.username}
//                             />
//                         ))}
//                     </div>
//                 </div>
//                 <button className="copybtn" onClick={copyRoomId}>
//                     Copy ROOM ID
//                 </button>
//                 <button className="leavebtn" onClick={leaveRoom}>
//                     Leave
//                 </button>
//             </div>
//             <div className="editorWrap">
//                 <Editor
//                     socketRef={socketRef}
//                     roomId={roomId}
//                     onCodeChange={(code) => {
//                         codeRef.current = code;
//                     }}
//                 />
//             </div>
//         </div>
//     );
// };

// export default EditorPage;















// import React, {useState} from 'react';
// import Client from '../components/Client.js';
// import Editor from '../components/Editor.js';
// // import {Logo} from '../public/Logo';


// const EditorPage = ()=>{

//     const [clients,setClients]=useState([
//         {socketId:1 ,username:'Rohan'},
//         {socketId:2 ,username:'Rohit'}
//     ]);

//  console.log("rendering EditorPage");
//     return (

                
//         <div className='Main'>

//             <div className='left'>

//                 <div className='left-inner'>

//                     <div className='logo'>
//                          <img className='logoImg'  src="Logo.PNG"
//                     alt="logo"/>
//                     </div>

//                     <h3>Connected</h3>


//                     <div className='client-list'>

//                        {
//                         clients.map((client)=>(
//                             <Client
//                               key={client.socketId}
//                               username={client.username}
//                             /> 
//                         ))
//                        }                    

//                     </div>
                        
//                 </div>


//                 <button className='copybtn'>copy Room ID</button>
//                 <button className='leavebtn'>Leave button</button>

//             </div>


//             <div className='right'>

//                  <Editor/> 
                  
//             </div>

//         </div>
        
        
//     )


// }
// export default EditorPage