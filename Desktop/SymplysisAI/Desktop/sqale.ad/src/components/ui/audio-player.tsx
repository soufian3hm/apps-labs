"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "lib/utils";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const CustomSlider = ({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn(
        "relative w-full h-1 bg-gray-200 rounded-full cursor-pointer",
        className
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
    >
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </motion.div>
  );
};

interface AudioPlayerProps {
  src: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

const AudioPlayer = ({ src, onEnded, autoPlay = false }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (audioRef.current) {
      const newVolume = value / 100;
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isFinite(progress) ? progress : 0);
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const time = (value / 100) * audioRef.current.duration;
      if (isFinite(time)) {
        audioRef.current.currentTime = time;
        setProgress(value);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        audioRef.current.volume = 1;
      }
    }
  };

  const setSpeed = (speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onEnded) {
      onEnded();
    }
  };

  return (
    <motion.div
      className="w-full bg-white rounded-lg p-3 border border-gray-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        src={src}
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <CustomSlider
            value={progress}
            onChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={togglePlay}
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>
            </motion.div>

            <div className="flex items-center gap-1">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-600 hover:text-gray-900"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : volume > 0.5 ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <Volume1 className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>

              <div className="w-20">
                <CustomSlider
                  value={volume * 100}
                  onChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={speed}
              >
                <Button
                  onClick={() => setSpeed(speed)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 text-xs text-gray-600 hover:text-gray-900",
                    playbackSpeed === speed && "bg-gray-100 text-gray-900"
                  )}
                >
                  {speed}x
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioPlayer;
