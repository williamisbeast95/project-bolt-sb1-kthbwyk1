import { useState } from 'react';
import HardstyleDMXController from './components/HardstyleDMXController';
import Stage3D from './components/Stage3D';
import AdvancedSettings from './components/AdvancedSettings';

function App() {
  const [advancedSettings, setAdvancedSettings] = useState({
    headSpinRate: 1,
    strobeFrequency: 10,
    blinderIntensity: 80,
    laserColors: ['#ff0000', '#00ff00'],
    co2BurstDuration: 0.5
  });

  const handleSettingChange = (key: string, value: any) => {
    setAdvancedSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          Hardstyle DMX Lighting Controller
        </h1>
        
        <Stage3D 
          movingHeads={[]} 
          strobes={[]} 
          lasers={[]} 
          blinders={[]} 
          co2Jets={[]} 
          ledBars={[]}
          bpm={150}
        />
        
        <AdvancedSettings 
          settings={advancedSettings}
          onSettingChange={handleSettingChange}
        />
        
        <HardstyleDMXController 
          advancedSettings={advancedSettings}
        />
      </div>
    </div>
  );
}

export default App;