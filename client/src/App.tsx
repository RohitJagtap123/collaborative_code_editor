import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import EditorPage from "./pages/EditorPage"
import Home from "./pages/HomePage"
import Landing from "./pages/LandingPage"
import Login from "./pages/LoginPage"
import SignUp from "./pages/SignupPage"
import ApproveAccess from "./pages/ApproveAccess"

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
