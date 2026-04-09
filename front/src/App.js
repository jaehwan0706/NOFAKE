// import React from 'react';
// import Dashboard from './admin/Dashboard'; // admin 폴더 안에 있는 Dashboard를 가져옵니다.
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       {/* 기본 샘플 코드를 지우고, 우리가 만든 대시보드 컴포넌트를 넣습니다. */}
//       <Dashboard />
//     </div>
//   );
// }

// export default App;
//2026.04.06 해당 선 위의 코드를 주석 처리하고 아래 코드로 대체함
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import "./App.css";

// import Header from "./user/components/Header";
// import Navbar from "./user/components/Navbar";

// import Login from "./user/pages/Login";
// import UserDashboard from "./user/pages/UserDashboard";
// import Participate from "./user/pages/Participate";
// import DrawStatus from "./user/pages/DrawStatus";
// import MyWallet from "./user/pages/MyWallet";
// import PuzzleExchange from "./user/pages/PuzzleExchange";
// import Transparency from "./user/pages/Transparency";
// import EventOverview from "./user/pages/EventOverview";

//  import AdminDashboard from "./admin/pages/AdminDashboard"; //
//  import EventControl from "./admin/pages/EventControl";//
//  import RedeemManagement from "./admin/pages/RedeemManagement";//

// function UserLayout({ children }) {
//   return (
//     <div>
//       <Header />
//       <Navbar />
//       <main style={{ padding: "20px" }}>{children}</main>
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* 로그인 */}
//         <Route path="/login" element={<Login />} />

//         {/* 로그인 이후 페이지 */}
//         <Route
//           path="/"
//           element={
//             <UserLayout>
//               <UserDashboard />
//             </UserLayout>
//           }
//         />
//         <Route
//           path="/participate/:slug"
//           element={
//             <UserLayout>
//               <Participate />
//             </UserLayout>
//           }
//         />
//         <Route
//           path="/draw-status"
//           element={
//             <UserLayout>
//               <DrawStatus />
//             </UserLayout>
//           }
//         />
//         <Route
//           path="/my-wallet"
//           element={
//             <UserLayout>
//               <MyWallet />
//             </UserLayout>
//           }
//         />
//         <Route
//           path="/puzzle-exchange"
//           element={
//             <UserLayout>
//               <PuzzleExchange />
//             </UserLayout>
//           }
//         />
//         <Route
//           path="/event-overview/:slug"
//           element={
//             <UserLayout>
//               <EventOverview />
//             </UserLayout>
//           }
//         />
//         <Route
//           path="/transparency"
//           element={
//             <UserLayout>
//               <Transparency />
//             </UserLayout>
//           }
//         />
//         <Route
//           path="/event-overview"
//           element={
//           <Navigate to="/event-overview/jordan-preorder" replace />}
//           />

//         <Route path="/admin" element={<AdminDashboard />} /> 
//         <Route path="/admin/event-control" element={<EventControl />} />
//         <Route path="/admin/redeem-management" element={<RedeemManagement />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

/////
// import React from 'react';
// import Dashboard from './user/UserDashboard'; 
// import AdminDashboard from "../admin/Dashboard";
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       {/* 기본 샘플 코드를 지우고, 우리가 만든 대시보드 컴포넌트를 넣습니다. */}
//       <Dashboard />
//     </div>
    
    
//   );
// }

// export default App;


import React from "react";
import Dashboard from "./user/UserDashboard";
import AdminDashboard from "./admin/Dashboard";
import "./App.css";

function App() {
  const isAdminPath = window.location.pathname.startsWith("/admin");

  return (
    <div className="App">
      {isAdminPath ? <AdminDashboard /> : <Dashboard />}
    </div>
  );
}

export default App;