import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./features/auth/pages/register";
import Login from "./features/auth/pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;