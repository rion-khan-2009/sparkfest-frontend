import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApiProvider } from "./context/ApiContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import { Status, Notices, About, Contact, Results } from "./pages/OtherPages";
import AdminPanel from "./admin/AdminPanel";

export default function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Admin - no navbar */}
            <Route path="/admin-system-92841" element={<AdminPanel />} />

            {/* Public - with navbar */}
            <Route path="/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/"         element={<Home />}     />
                  <Route path="/register" element={<Register />} />
                  <Route path="/status"   element={<Status />}   />
                  <Route path="/notices"  element={<Notices />}  />
                  <Route path="/results"  element={<Results />}  />
                  <Route path="/about"    element={<About />}    />
                  <Route path="/contact"  element={<Contact />}  />
                </Routes>
              </>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApiProvider>
  );
}