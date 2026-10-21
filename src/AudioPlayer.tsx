import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw, Headphones, FastForward, Activity } from 'lucide-react';
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
    a.download = `jyc_call_recording_${title ? title.replace(/\s+/g, '_') : 'audio'}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  if (!blobUrl && !loading) {
    return null;
  }

  return (
    <div className={`bg-[#0A0F17] text-slate-100 rounded-2xl p-4 sm:p-5 shadow-2xl border border-[#1E293B] relative overflow-hidden ${className}`}>
      
      {/* Glow highlight */}
      <div className="absolute top-0 left-0 w-64 h-12 bg-cyan-500/5 blur-2xl pointer-events-none"></div>

      <audio
        ref={audioRef}
        src={blobUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        
        {/* Left: Info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-mono font-bold text-slate-100 truncate">
                {title || 'CINTA DE AUDIO // TELEFONÍA FORENSE'}
              </h4>
              {isPlaying && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate">
              {subtitle || 'Master de audio con canal dual de prospección y cliente'}
            </p>
          </div>
        </div>

        {/* Center: Play Controls & Progress Scrubber */}
        <div className="flex-1 w-full max-w-lg flex items-center gap-3 bg-[#080C14] px-3.5 py-2 rounded-xl border border-[#1E293B]">
          <button
            onClick={togglePlay}
            disabled={!blobUrl}
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-40 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
            }`}
            title={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <span className="text-[11px] font-mono font-bold text-cyan-300 min-w-[36px] text-right">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />

          <span className="text-[11px] font-mono text-slate-400 min-w-[36px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Right: Secondary Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Speed Stepper */}
          <button
            onClick={handleSpeedToggle}
            className="px-2.5 py-1.5 bg-[#080C14] hover:bg-[#111A29] text-cyan-300 rounded-lg text-[10px] font-mono font-bold border border-[#1E293B] hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="Velocidad de reproducción"
          >
            {playbackRate}x
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1.5 bg-[#080C14] px-2 py-1.5 rounded-lg border border-[#1E293B]">
            <button
              onClick={toggleMute}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title={isMuted ? "Activar audio" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-14 h-1 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-cyan-400 hidden lg:block"
            />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-2 bg-[#080C14] hover:bg-[#111A29] text-slate-300 hover:text-cyan-300 rounded-lg border border-[#1E293B] hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="Descargar archivo MP3"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}