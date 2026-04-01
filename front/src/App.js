import React from 'react';
import Dashboard from './admin/Dashboard'; // admin 폴더 안에 있는 Dashboard를 가져옵니다.
import './App.css';

function App() {
  return (
    <div className="App">
      {/* 기본 샘플 코드를 지우고, 우리가 만든 대시보드 컴포넌트를 넣습니다. */}
      <Dashboard />
    </div>
  );
}

export default App;