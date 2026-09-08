import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw, Headphones, FastForward } from 'lucide-react';
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

  // Load audio source from blob / indexedDb / url
  useEffect(() => {
    let active = true;

    async function loadAudioSource() {
      setLoading(true);

      // 1. Direct blob provided from user upload
      if (audioBlob && audioBlob.size > 0) {
        const url = URL.createObjectURL(audioBlob);
        if (active) {
          setBlobUrl(url);
          setLoading(false);
        }
        return;
      }

      // 2. If audioId exists, check if we already have the mixed MP3 in IndexedDB
      if (audioId) {
        try {
          const cachedBlob = await getAudio(audioId);
          if (cachedBlob && cachedBlob.size > 0 && active) {
            const url = URL.createObjectURL(cachedBlob);
            setBlobUrl(url);
            // If it's already the full MP3 (or no audioUrl to fetch), finish loading
            if (cachedBlob.type === 'audio/mpeg' || !audioUrl) {
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Error checking IDB cache:', err);
        }
      }

      // 3. Fetch full 2-way conversation audio from ElevenLabs (user + AI voice)
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

      // 4. Fallback to whatever is in IndexedDB
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
    a.download = `call_recording_${title ? title.replace(/\s+/g, '_') : 'audio'}.mp3`;
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
    <div className={`bg-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-800 ${className}`}>
      <audio
        ref={audioRef}
        src={blobUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-100 truncate">{title || 'Call Audio Recording'}</h4>
            <p className="text-[10px] text-slate-400 truncate">{subtitle || 'Listen to complete conversation'}</p>
          </div>
        </div>

        {/* Center: Play Controls & Progress */}
        <div className="flex-1 w-full max-w-md flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={!blobUrl}
            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          <span className="text-[11px] font-mono text-slate-400 min-w-[32px] text-right">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
          />

          <span className="text-[11px] font-mono text-slate-400 min-w-[32px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Right: Secondary Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Speed Button */}
          <button
            onClick={handleSpeedToggle}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700 transition-colors"
            title="Playback speed"
          >
            {playbackRate}x
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
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
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hidden md:block"
            />
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Download audio recording"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
