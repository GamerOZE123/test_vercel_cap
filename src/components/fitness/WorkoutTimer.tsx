
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkoutTimerProps {
  isOpen: boolean;
  onClose: () => void;
  workoutName?: string;
}

export default function WorkoutTimer({ isOpen, onClose, workoutName = "Workout" }: WorkoutTimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
  };

  const handleClose = () => {
    handleStop();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="absolute top-4 left-4 text-white hover:bg-white/10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Workout Name */}
      <h1 className="text-white text-2xl font-bold mb-8">{workoutName}</h1>

      {/* Timer Display */}
      <div className="text-white text-8xl md:text-9xl font-mono font-bold mb-12">
        {formatTime(time)}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-6">
        {!isRunning ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
          >
            <Play className="w-6 h-6 mr-2" />
            Start
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button
                onClick={handleResume}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                Resume
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 text-lg"
              >
                <Pause className="w-6 h-6 mr-2" />
                Pause
              </Button>
            )}
            <Button
              onClick={handleStop}
              size="lg"
              variant="destructive"
              className="px-8 py-4 text-lg"
            >
              <Square className="w-6 h-6 mr-2" />
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
