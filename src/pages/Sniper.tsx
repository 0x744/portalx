import React from 'react';
import { SniperInterface } from '../components/SniperInterface';

const Sniper: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sniper</h1>
      <SniperInterface />
    </div>
  );
};

export default Sniper; 