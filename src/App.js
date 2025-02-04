import './App.css';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import EditorPage from './pages/EditorPage';
import Home from './pages/Home'; 
import Login from './pages/LogIn';
import SignUp from './pages/SignUp';

function App() {
  return (
     <div>
     <Toaster position="top-right" reverseOrder={false} />
     <BrowserRouter>
         <Routes>
             <Route path="/" element={<Login/>}></Route>
            <Route path="/signup" element={<SignUp/>}></Route>
            <Route path="/dashboard" element={<Home/>}></Route>
             <Route path="/editor/:roomId" element={<EditorPage/>}></Route>
         </Routes>
     </BrowserRouter>
     </div>
  );
}

export default App;