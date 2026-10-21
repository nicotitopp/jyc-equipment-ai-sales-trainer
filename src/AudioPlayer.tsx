import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Headphones } from 'lucide-react';
import { getAudio, saveAudio } from './audioDb';

interface AudioPlayerProps {
  audioId?: string;
  audioBlob?: Blob | null;
  audioUrl?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function AudioPlayer({ audioId, audioBlob, audioUrl, title, subtitle, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAudioSource() {
      setLoading(true);

      if (audioBlob && audioBlob.size > 0) {
        const url = URL.createObjectURL(audioBlob);
        if (active) {
          setBlobUrl(url);
          setLoading(false);
        }
        return;
      }

      if (audioId) {
        try {
          const cachedBlob = await getAudio(audioId);
          if (cachedBlob && cachedBlob.size > 0 && active) {
            const url = URL.createObjectURL(cachedBlob);
            setBlobUrl(url);
            if (cachedBlob.type === 'audio/mpeg' || !audioUrl) {
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Error checking IDB cache:', err);
        }
      }

      if (audioUrl) {
        try {
          const res = await fetch(audioUrl);
          if (res.ok) {
            const fetchedBlob = await res.blob();
            if (fetchedBlob && fetchedBlob.size > 0 && active) {
              const url = URL.createObjectURL(fetchedBlob);
              setBlobUrl(url);
              if (audioId) {
                saveAudio(audioId, fetchedBlob).catch(console.warn);
              }
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Error fetching 2-way conversation audio:', err);
        }
      }

      if (audioId && active) {
        try {
          const fallbackBlob = await getAudio(audioId);
          if (fallbackBlob && fallbackBlob.size > 0 && active) {
            const url = URL.createObjectURL(fallbackBlob);
            setBlobUrl(url);
          }
        } catch (err) {
          console.warn('Error loading fallback audio:', err);
        }
      }

      if (active) setLoading(false);
    }

    loadAudioSource();

    return () => {
      active = false;
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [audioId, audioBlob, audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !blobUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `jyc_recording_${title ? title.replace(/\s+/g, '_') : 'call'}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  if (!blobUrl && !loading) {
    return null;
  }

  return (
    <div className={`bg-[#0F172A] text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-800 ${className}`}>
      <audio
        ref={audioRef}
        src={blobUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-display font-bold text-white truncate">
              {title || 'Call Audio Recording'}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {subtitle || 'Listen to the complete audio'}
            </p>
          </div>
        </div>

        {/* Center: Play Controls & Progress */}
        <div className="flex-1 w-full max-w-lg flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={!blobUrl}
            className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <span className="text-xs font-mono text-slate-300 min-w-[34px] text-right">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
          />

          <span className="text-xs font-mono text-slate-400 min-w-[34px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Right: Secondary Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleSpeedToggle}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Playback speed"
          >
            {playbackRate}x
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hidden lg:block"
            />
          </div>

          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Download audio"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
