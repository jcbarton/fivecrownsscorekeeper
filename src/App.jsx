import React from 'react';
import FiveCrownsScorekeeper from './scorekeeper';

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="floating-orb w-96 h-96 bg-primary-500 top-[-10%] left-[-10%]" style={{animationDelay: '0s'}}></div>
      <div className="floating-orb w-80 h-80 bg-accent-500 top-[60%] right-[-5%]" style={{animationDelay: '2s'}}></div>
      <div className="floating-orb w-64 h-64 bg-primary-400 bottom-[-5%] left-[30%]" style={{animationDelay: '4s'}}></div>
      
      {/* Main content */}
      <div className="relative z-10">
        <FiveCrownsScorekeeper />
      </div>
    </div>
  );
}

export default App;
