import './App.css';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import EditorPage from './pages/EditorPage';
import Home from './pages/Home'; 
import Login from './pages/LogIn';
import SignUp from './pages/SignUp';
import ApproveAccess from './pages/ApproveAccess';
import Landing from './pages/Landing';

function App() {
  return (
     <div>
     <Toaster position="top-right" reverseOrder={false} />
     <BrowserRouter>
         <Routes>
             <Route path="/" element={<Landing/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/signup" element={<SignUp/>}></Route>
            <Route path="/dashboard" element={<Home/>}></Route>
             <Route path="/editor/:roomId" element={<EditorPage/>}></Route>
             <Route path="/approve-access" element={<ApproveAccess/>}></Route>
         </Routes>
     </BrowserRouter>
     </div>
  );
}

export default App;