import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Zap, Music, RotateCw, Droplet } from 'lucide-react';

interface Props {
  advancedSettings: {
    headSpinRate: number;
    strobeFrequency: number;
    blinderIntensity: number;
    laserColors: string[];
    co2BurstDuration: number;
  };
}

const HardstyleDMXController: React.FC<Props> = ({ advancedSettings }) => {
  // State for lighting equipment
  const [movingHeads, setMovingHeads] = useState(Array(4).fill({ active: false, position: 0, color: '#ff0000', strobe: false }));
  const [strobes, setStrobes] = useState(Array(6).fill({ active: false, intensity: 0 }));
  const [lasers, setLasers] = useState(Array(2).fill({ active: false, pattern: 'sweep', color: '#00ff00' }));
  const [blinders, setBlinders] = useState(Array(4).fill({ active: false, intensity: 0 }));
  const [co2Jets, setCo2Jets] = useState(Array(2).fill({ active: false }));
  const [ledBars, setLedBars] = useState(Array(8).fill({ active: false, color: '#0000ff', chase: false }));
  
  // Playback controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(150);
  const [currentScene, setCurrentScene] = useState('intro');
  
  // Animation frame reference
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Scene definitions (timelines)
  const scenes = {
    intro: {
      name: 'Intro',
      duration: 16, // in beats
      description: 'Slow-moving heads with soft washes, pulsating LED bars',
      timeline: [
        { time: 0, action: 'movingHeads', params: { active: true, color: '#3366ff', strobe: false } },
        { time: 4, action: 'ledBars', params: { active: true, color: '#3366ff', chase: true } },
        { time: 8, action: 'lasers', params: { active: true, pattern: 'sweep', color: '#3366ff' } },
        { time: 12, action: 'blinders', params: { active: true, intensity: 20 } }
      ]
    },
    buildup: {
      name: 'Buildup',
      duration: 16,
      description: 'Increasing speed of color chases, laser sweeps, and fog bursts',
      timeline: [
        { time: 0, action: 'ledBars', params: { active: true, color: '#ff3366', chase: true } },
        { time: 4, action: 'movingHeads', params: { active: true, color: '#ff3366', strobe: false } },
        { time: 8, action: 'lasers', params: { active: true, pattern: 'circle', color: '#ff3366' } },
        { time: 12, action: 'co2Jets', params: { active: true } },
        { time: 14, action: 'blinders', params: { active: true, intensity: 50 } }
      ]
    },
    drop: {
      name: 'Drop',
      duration: 16,
      description: 'Blinders flash, strobes burst, moving heads strobe pan fast',
      timeline: [
        { time: 0, action: 'strobes', params: { active: true, intensity: 100 } },
        { time: 0, action: 'blinders', params: { active: true, intensity: 100 } },
        { time: 0, action: 'movingHeads', params: { active: true, color: '#ff0000', strobe: true } },
        { time: 0, action: 'lasers', params: { active: true, pattern: 'starburst', color: '#ff0000' } },
        { time: 4, action: 'co2Jets', params: { active: true } },
        { time: 8, action: 'co2Jets', params: { active: true } },
        { time: 12, action: 'co2Jets', params: { active: true } }
      ]
    },
    kickRolls: {
      name: 'Kick Rolls',
      duration: 8,
      description: 'Alternating strobe hits, blinder flashes, laser stabs',
      timeline: [
        { time: 0, action: 'strobes', params: { active: true, intensity: 100 } },
        { time: 1, action: 'strobes', params: { active: false, intensity: 0 } },
        { time: 2, action: 'blinders', params: { active: true, intensity: 100 } },
        { time: 3, action: 'blinders', params: { active: false, intensity: 0 } },
        { time: 4, action: 'lasers', params: { active: true, pattern: 'stab', color: '#ffffff' } },
        { time: 5, action: 'lasers', params: { active: false, pattern: 'stab', color: '#ffffff' } },
        { time: 6, action: 'co2Jets', params: { active: true } },
        { time: 7, action: 'movingHeads', params: { active: true, color: '#ffffff', strobe: true } }
      ]
    },
    breakdown: {
      name: 'Breakdown',
      duration: 16,
      description: 'Slow fade-out effects with smooth color transitions',
      timeline: [
        { time: 0, action: 'movingHeads', params: { active: true, color: '#9933ff', strobe: false } },
        { time: 4, action: 'lasers', params: { active: true, pattern: 'sweep', color: '#9933ff' } },
        { time: 8, action: 'ledBars', params: { active: true, color: '#9933ff', chase: false } },
        { time: 12, action: 'strobes', params: { active: false, intensity: 0 } },
        { time: 14, action: 'blinders', params: { active: false, intensity: 0 } }
      ]
    }
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      // Calculate beat time (60000ms / bpm = ms per beat)
      const msPerBeat = 60000 / bpm;
      const beatIncrement = deltaTime / msPerBeat;
      
      // Update current time in beats
      setCurrentTime(prevTime => {
        const newTime = prevTime + beatIncrement;
        const currentSceneData = scenes[currentScene];
        
        // Check if we need to loop the current scene
        if (newTime >= currentSceneData.duration) {
          return 0; // Loop back to start of scene
        }
        
        return newTime;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, bpm, currentScene]);

  // Process timeline events
  useEffect(() => {
    const currentSceneData = scenes[currentScene];
    if (!currentSceneData) return;
    
    // Find all events that should have triggered by the current time
    const eventsToProcess = currentSceneData.timeline.filter(event => {
      // Events trigger when we've reached or just passed their time
      return Math.floor(currentTime) === Math.floor(event.time);
    });
    
    // Process the events
    eventsToProcess.forEach(event => {
      switch (event.action) {
        case 'movingHeads':
          setMovingHeads(prev => prev.map(head => ({ ...head, ...event.params })));
          break;
        case 'strobes':
          setStrobes(prev => prev.map(strobe => ({ ...strobe, ...event.params })));
          break;
        case 'lasers':
          setLasers(prev => prev.map(laser => ({ ...laser, ...event.params })));
          break;
        case 'blinders':
          setBlinders(prev => prev.map(blinder => ({ ...blinder, ...event.params })));
          break;
        case 'co2Jets':
          setCo2Jets(prev => {
            // Only activate one CO2 jet at a time, alternating between them
            const newJets = [...prev];
            const jetIndex = Math.floor(currentTime) % newJets.length;
            newJets[jetIndex] = { ...newJets[jetIndex], ...event.params };
            // If turning on, schedule automatic turn off after half a beat
            if (event.params.active) {
              setTimeout(() => {
                setCo2Jets(current => {
                  const updated = [...current];
                  updated[jetIndex] = { ...updated[jetIndex], active: false };
                  return updated;
                });
              }, (60000 / bpm) / 2); // Half a beat duration
            }
            return newJets;
          });
          break;
        case 'ledBars':
          setLedBars(prev => prev.map(bar => ({ ...bar, ...event.params })));
          break;
        default:
          break;
      }
    });
  }, [currentTime, currentScene, bpm]);

  // Functions for manual control
  const handlePlay = () => setIsPlaying(prev => !prev);
  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };
  const handleSceneChange = (scene: string) => {
    setCurrentScene(scene);
    setCurrentTime(0);
  };
  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => setBpm(parseInt(e.target.value));

  // Render the DMX controller UI
  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gray-900 text-white rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Hardstyle DMX Lighting Controller</h1>
      
      {/* Transport controls */}
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button 
              className={`p-2 rounded-full ${isPlaying ? 'bg-red-600' : 'bg-green-600'}`}
              onClick={handlePlay}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button 
              className="p-2 rounded-full bg-gray-700"
              onClick={handleReset}
            >
              <RotateCcw size={24} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Music size={20} />
            <span className="font-mono">BPM:</span>
            <input 
              type="number" 
              min="100" 
              max="200" 
              value={bpm} 
              onChange={handleBpmChange}
              className="w-16 px-2 py-1 bg-gray-700 rounded text-center"
            />
          </div>
          
          <div className="font-mono">
            <span>Beat: {Math.floor(currentTime) + 1}/{scenes[currentScene]?.duration}</span>
          </div>
        </div>
        
        {/* Scene selection */}
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(scenes).map(([key, scene]) => (
            <button
              key={key}
              className={`p-2 rounded ${currentScene === key ? 'bg-purple-700' : 'bg-gray-700'}`}
              onClick={() => handleSceneChange(key)}
            >
              {scene.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Scene description */}
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <h3 className="font-bold mb-2">Current Scene: {scenes[currentScene]?.name}</h3>
        <p className="text-gray-300">{scenes[currentScene]?.description}</p>
      </div>
      
      {/* Equipment visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Moving Heads */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center">
            <RotateCw size={18} className="mr-2" />
            Moving Heads
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {movingHeads.map((head, i) => (
              <div 
                key={i} 
                className="aspect-square rounded-full flex items-center justify-center relative"
                style={{ 
                  backgroundColor: head.active ? head.color : '#333',
                  opacity: head.active ? 1 : 0.3,
                  animation: head.active && head.strobe ? 'strobe 0.1s alternate infinite' : 'none'
                }}
              >
                <div 
                  className="w-1/2 h-1/2 bg-white rounded-full absolute"
                  style={{
                    animation: head.active ? `rotate ${60000 / bpm * 4}ms linear infinite` : 'none',
                    opacity: head.active ? 0.8 : 0.3
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Strobes */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center">
            <Zap size={18} className="mr-2" />
            Strobes
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {strobes.map((strobe, i) => (
              <div 
                key={i} 
                className="h-12 rounded bg-white"
                style={{ 
                  opacity: strobe.active ? strobe.intensity / 100 : 0.1,
                  animation: strobe.active ? 'strobe 0.05s alternate infinite' : 'none'
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Lasers */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center">
            <span className="mr-2">⤫</span>
            Lasers
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {lasers.map((laser, i) => (
              <div 
                key={i} 
                className="h-32 rounded bg-black flex items-center justify-center relative overflow-hidden"
              >
                {laser.active && (
                  <div className="laser-effect absolute inset-0">
                    <div
                      className="absolute"
                      style={{
                        backgroundColor: laser.color,
                        height: '2px',
                        width: '100%',
                        top: '50%',
                        left: 0,
                        boxShadow: `0 0 8px 2px ${laser.color}`,
                        animation: `${laser.pattern === 'sweep' ? 'laser-sweep' : 
                                    laser.pattern === 'circle' ? 'laser-circle' : 
                                    laser.pattern === 'starburst' ? 'laser-starburst' : 'laser-stab'} 
                                    ${60000 / bpm * 2}ms infinite`
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Blinders */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Blinders</h3>
          <div className="grid grid-cols-4 gap-2">
            {blinders.map((blinder, i) => (
              <div 
                key={i} 
                className="h-12 rounded bg-yellow-50"
                style={{ 
                  opacity: blinder.active ? blinder.intensity / 100 : 0.1
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* CO2 Jets */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center">
            <Droplet size={18} className="mr-2" />
            CO2 Jets
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {co2Jets.map((jet, i) => (
              <div 
                key={i} 
                className="h-24 rounded bg-gray-900 flex items-end justify-center"
              >
                {jet.active && (
                  <div 
                    className="co2-effect w-full"
                    style={{
                      height: '100%',
                      background: 'linear-gradient(to top, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.8))',
                      animation: 'co2-burst 0.5s ease-out'
                    }}
                  ></div>
                )}
                <div className="h-4 w-8 bg-gray-700 rounded-t absolute bottom-0"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* LED Bars */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold mb-2">LED Bars</h3>
          <div className="grid grid-cols-8 gap-1">
            {ledBars.map((bar, i) => (
              <div 
                key={i} 
                className="h-32 w-full rounded"
                style={{ 
                  backgroundColor: bar.active ? bar.color : '#333',
                  opacity: bar.active ? 1 : 0.3,
                  animation: bar.active && bar.chase ? `led-chase ${60000 / bpm * 4}ms infinite ${i * 125}ms` : 'none'
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* DMX Address Map */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-bold mb-2">DMX Address Map</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p>Moving Heads: 1-32</p>
            <p>Strobes: 33-48</p>
            <p>Lasers: 49-64</p>
          </div>
          <div>
            <p>Blinders: 65-72</p>
            <p>CO2 Jets: 73-76</p>
            <p>LED Bars: 77-104</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes strobe {
          0% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        
        @keyframes rotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes laser-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(180deg); }
        }
        
        @keyframes laser-circle {
          0% { transform: rotate(0deg); width: 10%; left: 45%; }
          25% { transform: rotate(90deg); width: 80%; left: 10%; }
          50% { transform: rotate(180deg); width: 10%; left: 45%; }
          75% { transform: rotate(270deg); width: 80%; left: 10%; }
          100% { transform: rotate(360deg); width: 10%; left: 45%; }
        }
        
        @keyframes laser-starburst {
          0% { transform: rotate(0deg); opacity: 0.8; }
          25% { transform: rotate(45deg); opacity: 0.4; }
          50% { transform: rotate(90deg); opacity: 0.8; }
          75% { transform: rotate(135deg); opacity: 0.4; }
          100% { transform: rotate(180deg); opacity: 0.8; }
        }
        
        @keyframes laser-stab {
          0% { opacity: 0; }
          10% { opacity: 1; }
          20% { opacity: 0; }
          100% { opacity: 0; }
        }
        
        @keyframes co2-burst {
          0% { height: 0; opacity: 0; }
          20% { height: 100%; opacity: 1; }
          100% { height: 100%; opacity: 0; }
        }
        
        @keyframes led-chase {
          0% { opacity: 0.3; }
          10% { opacity: 1; }
          30% { opacity: 0.3; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default HardstyleDMXController;