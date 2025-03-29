import React from 'react';
import { Settings } from 'lucide-react';

interface AdvancedSettingsProps {
  settings: {
    headSpinRate: number;
    strobeFrequency: number;
    blinderIntensity: number;
    laserColors: string[];
    co2BurstDuration: number;
  };
  onSettingChange: (key: string, value: any) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ settings, onSettingChange }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="font-bold mb-4 flex items-center">
        <Settings size={18} className="mr-2" />
        Advanced Settings
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Head Spin Rate</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.headSpinRate}
              onChange={(e) => onSettingChange('headSpinRate', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">
              {settings.headSpinRate}x Speed
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Strobe Frequency</label>
            <input
              type="range"
              min="1"
              max="20"
              value={settings.strobeFrequency}
              onChange={(e) => onSettingChange('strobeFrequency', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">
              {settings.strobeFrequency} Hz
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Blinder Intensity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.blinderIntensity}
              onChange={(e) => onSettingChange('blinderIntensity', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">
              {settings.blinderIntensity}%
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Laser Colors</label>
            {settings.laserColors.map((color, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const newColors = [...settings.laserColors];
                    newColors[index] = e.target.value;
                    onSettingChange('laserColors', newColors);
                  }}
                  className="w-8 h-8 rounded"
                />
                <span className="text-xs">Laser {index + 1}</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm mb-2">CO2 Burst Duration</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.co2BurstDuration}
              onChange={(e) => onSettingChange('co2BurstDuration', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">
              {settings.co2BurstDuration}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;