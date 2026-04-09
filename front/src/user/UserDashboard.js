import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./UserDashboard.css";

import Header from "./components/Header";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Participate from "./pages/Participate";
import DrawStatus from "./pages/DrawStatus";
import MyWallet from "./pages/MyWallet";
import PuzzleExchange from "./pages/PuzzleExchange";
import Transparency from "./pages/Transparency";
import EventOverview from "./pages/EventOverview";

 //import AdminDashboard from "./admin/pages/AdminDashboard"; //
 //import EventControl from "./admin/pages/EventControl";//
 //import RedeemManagement from "./admin/pages/RedeemManagement";//

function UserLayout({ children }) {
  return (
    <div>
      <Header />
      <Navbar />
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 */}
        <Route path="/login" element={<Login />} />

        {/* 로그인 이후 페이지 */}
        <Route
          path="/"
          element={
            <UserLayout>
              <Home />
            </UserLayout>
          }
        />
        <Route
          path="/participate/:slug"
          element={
            <UserLayout>
              <Participate />
            </UserLayout>
          }
        />
        <Route
          path="/draw-status"
          element={
            <UserLayout>
              <DrawStatus />
            </UserLayout>
          }
        />
        <Route
          path="/my-wallet"
          element={
            <UserLayout>
              <MyWallet />
            </UserLayout>
          }
        />
        <Route
          path="/puzzle-exchange"
          element={
            <UserLayout>
              <PuzzleExchange />
            </UserLayout>
          }
        />
        <Route
            path="/event-overview"
            element={
                <UserLayout>
                <EventOverview />
                </UserLayout>
            }
        />

        <Route
            path="/event-overview/:slug"
            element={
                <UserLayout>
                <EventOverview />
                </UserLayout>
            }
        />
        {/* <Route
          path="/transparency"
          element={
            <UserLayout>
              <Transparency />
            </UserLayout>
          }
        /> */}
        {/* <Route
          path="/event-overview"
          element={
          <Navigate to="/event-overview" replace />}
          /> */}

        {/* <Route path="/admin" element={<AdminDashboard />} /> 
        <Route path="/admin/event-control" element={<EventControl />} />
        <Route path="/admin/redeem-management" element={<RedeemManagement />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;