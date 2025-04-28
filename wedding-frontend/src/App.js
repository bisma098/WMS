import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import UserInfo from './components/UserInfo';
import MainLayout from './components/MainLayout';
import SubLayout from './components/SubLayout';
import SubLayout2 from './components/SubLayout2';
import Tasks from './components/Tasks';
import Payments from './components/Payments';
import Weddings from './components/Weddings';
import Events from './components/Events';
import EventDetails from './components/EventDetails';
import Guests from './components/Guests';
import Vendors from './components/Vendors';
import Profile from "./components/Profile";
import HallVendors from './components/HallVendors';
import CateringVendors from './components/CateringVendors';
import PhotographyVendors from './components/PhotographyVendors';
import DecorVendors from './components/DecorVendors';
import DjVendors from './components/DjVendors';
import CoverPage from './components/CoverPage';
import ManagerDashboard from './components/ManagerDashboard';


// NEW imports
import ManagerLogin from './components/ManagerLogin';
import ManagerSignup from './components/ManagerSignup';
import ManagerInfo from './components/ManagerInfo';


function App() {
  return (
    <Router>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<CoverPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user-info" element={<UserInfo />} />
        <Route path="/user-info" element={<UserInfo />} />

        {/* Manager  */}
        <Route path="/manager-login" element={<ManagerLogin />} />
        <Route path="/manager-signup" element={<ManagerSignup />} />
        <Route path="/manager-info" element={<ManagerInfo />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />

        {/* Pages with Main Header Only */}
        <Route element={<MainLayout />}>
          {/* Pages with Main Header + Header2 */}
          <Route element={<SubLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/weddings" element={<Weddings />} />
            <Route path="/wedding/:weddingId/events" element={<Events />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/profile/:username" element={<Profile />} />
          </Route>

          {/* Pages with Main Header + Header2 */}
          <Route path="/event-details/:eventId" element={<SubLayout2 />}>
            <Route index element={<EventDetails />} />
            <Route path="guests" element={<Guests />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="/event-details/:eventId/vendors/book/hall" element={<HallVendors />} />
            <Route path="/event-details/:eventId/vendors/book/catering" element={<CateringVendors />} />
            <Route path="/event-details/:eventId/vendors/book/photography" element={<PhotographyVendors />} />
            <Route path="/event-details/:eventId/vendors/book/decor" element={<DecorVendors />} />
            <Route path="/event-details/:eventId/vendors/book/dj" element={<DjVendors />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
