import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useMemo, useState } from "react";
import "./UserDashboard.css";

import Header from "./components/Header";
import Navbar from "./components/Navbar";

import Login from "./pages/KakaoLogin";
import Home from "./pages/Home";
import Participate from "./pages/Participate";
import DrawStatus from "./pages/DrawStatus";
import MyWallet from "./pages/MyWallet";
import PuzzleExchange from "./pages/PuzzleExchange";

import mockEvents from "./data/mockEvents";

function DevWalletTester({
  walletAddress,
  onConnect,
  onDisconnect,
  onResetMint,
  onRevealAll,
  onResetReveal,
}) {
  const isConnected = Boolean(walletAddress);

  return (
    <div className="dev-wallet-tester">
      <span className="dev-wallet-label">테스트용 임시 지갑 연결</span>

      {isConnected ? (
        <>
          <button
            type="button"
            className="dev-wallet-btn disconnect"
            onClick={onDisconnect}
          >
            연결 해제
          </button>

          <button
            type="button"
            className="dev-wallet-btn reset"
            onClick={onResetMint}
          >
            민팅 초기화
          </button>

          <button
            type="button"
            className="dev-wallet-btn reveal"
            onClick={onRevealAll}
          >
            전체 리빌
          </button>

          <button
            type="button"
            className="dev-wallet-btn reveal-reset"
            onClick={onResetReveal}
          >
            리빌 초기화
          </button>
        </>
      ) : (
        <button
          type="button"
          className="dev-wallet-btn"
          onClick={onConnect}
        >
          연결
        </button>
      )}
    </div>
  );
}

function ProtectedLayout({
  children,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
  onResetMint,
  onRevealAll,
  onResetReveal,
}) {
  if (!walletAddress) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <DevWalletTester
        walletAddress={walletAddress}
        onConnect={onConnectWallet}
        onDisconnect={onDisconnectWallet}
        onResetMint={onResetMint}
        onRevealAll={onRevealAll}
        onResetReveal={onResetReveal}
      />

      <Header walletAddress={walletAddress} />
      <Navbar />

      <main className="app-main">
        <div className="page-shell">{children}</div>
      </main>
    </div>
  );
}

function App() {
  const [walletAddress, setWalletAddress] = useState(
    () => localStorage.getItem("testWalletAddress") || ""
  );

  const [revealState, setRevealState] = useState(
    () => JSON.parse(localStorage.getItem("revealState") || "{}")
  );

  const events = useMemo(() => {
    return mockEvents.map((event) => ({
      ...event,
      status: {
        ...event.status,
        isRevealed: revealState[event.slug] ?? false,
      },
    }));
  }, [revealState]);

  const handleConnectWallet = () => {
    const testAddress = "0x1234567890abcdef1234567890abcdef12345678";
    localStorage.setItem("testWalletAddress", testAddress);
    setWalletAddress(testAddress);
  };

  const handleDisconnectWallet = () => {
    localStorage.removeItem("testWalletAddress");
    localStorage.removeItem("mintedEvents");
    localStorage.removeItem("mintedTickets");
    localStorage.removeItem("revealState");
    setWalletAddress("");
    setRevealState({});
  };

  const handleResetMint = () => {
    localStorage.removeItem("mintedEvents");
    localStorage.removeItem("mintedTickets");
  };

  const handleRevealAll = () => {
    const nextRevealState = Object.fromEntries(
      mockEvents.map((event) => [event.slug, true])
    );

    localStorage.setItem("revealState", JSON.stringify(nextRevealState));
    setRevealState(nextRevealState);
  };

  const handleResetReveal = () => {
    const nextRevealState = Object.fromEntries(
      mockEvents.map((event) => [event.slug, false])
    );

    localStorage.setItem("revealState", JSON.stringify(nextRevealState));
    setRevealState(nextRevealState);
  };

  const handleLoginSuccess = (newWalletAddress) => {
    localStorage.setItem("testWalletAddress", newWalletAddress);
    setWalletAddress(newWalletAddress);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            walletAddress ? (
              <Navigate to="/home" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedLayout
              walletAddress={walletAddress}
              onConnectWallet={handleConnectWallet}
              onDisconnectWallet={handleDisconnectWallet}
              onResetMint={handleResetMint}
              onRevealAll={handleRevealAll}
              onResetReveal={handleResetReveal}
            >
              <Home events={events} />
            </ProtectedLayout>
          }
        />

        <Route
          path="/participate/:slug"
          element={
            <ProtectedLayout
              walletAddress={walletAddress}
              onConnectWallet={handleConnectWallet}
              onDisconnectWallet={handleDisconnectWallet}
              onResetMint={handleResetMint}
              onRevealAll={handleRevealAll}
              onResetReveal={handleResetReveal}
            >
              <Participate walletAddress={walletAddress} events={events} />
            </ProtectedLayout>
          }
        />

        <Route
          path="/draw-status"
          element={
            <ProtectedLayout
              walletAddress={walletAddress}
              onConnectWallet={handleConnectWallet}
              onDisconnectWallet={handleDisconnectWallet}
              onResetMint={handleResetMint}
              onRevealAll={handleRevealAll}
              onResetReveal={handleResetReveal}
            >
              <DrawStatus events={events} revealState={revealState} />
            </ProtectedLayout>
          }
        />

        <Route
          path="/my-wallet"
          element={
            <ProtectedLayout
              walletAddress={walletAddress}
              onConnectWallet={handleConnectWallet}
              onDisconnectWallet={handleDisconnectWallet}
              onResetMint={handleResetMint}
              onRevealAll={handleRevealAll}
              onResetReveal={handleResetReveal}
            >
              <MyWallet revealState={revealState} />
            </ProtectedLayout>
          }
        />

        <Route
          path="/puzzle-exchange"
          element={
            <ProtectedLayout
              walletAddress={walletAddress}
              onConnectWallet={handleConnectWallet}
              onDisconnectWallet={handleDisconnectWallet}
              onResetMint={handleResetMint}
              onRevealAll={handleRevealAll}
              onResetReveal={handleResetReveal}
            >
              <PuzzleExchange />
            </ProtectedLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;