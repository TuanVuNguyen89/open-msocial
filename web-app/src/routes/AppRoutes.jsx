import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Friends from "../pages/Friends";
import PendingRequests from "../pages/PendingRequests";
import UserProfile from "../pages/UserProfile";
import Registration from "../pages/Registration";
import Authenticate from "../components/Authenticate";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/pending-requests" element={<PendingRequests />} />
        <Route path="/user-profile/:userId" element={<UserProfile />} />
        <Route path="/authenticate" element={<Authenticate />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
