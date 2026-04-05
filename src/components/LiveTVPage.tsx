import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, Tv, Maximize, Minimize, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const getFacebookEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  if (url.includes("facebook.com/plugins/video.php")) return url;
  const encoded = encodeURIComponent(url);
  return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&autoplay=true&mute=0`;
};

interface LiveStream {
  id: string;
  title: string;
  facebook_url: string;
  is_active: boolean;
}

const LiveTVPage = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("live_streams")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      const list = (data ?? []) as LiveStream[];
      setStreams(list);
      if (list.length > 0) setActiveStream(list[0]);
      setLoading(false);
    };
    fetchStreams();
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsFullscreen(false);
      document.body.style.overflow = "";
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
        document.body.style.overflow = "";
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const embedUrl = activeStream ? getFacebookEmbedUrl(activeStream.facebook_url) : null;

  return (
    <div className="pb-20">
      {/* Fullscreen overlay */}
      {isFullscreen && embedUrl && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            style={{ border: "none", overflow: "hidden" }}
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
          {/* Top bar overlay */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-destructive rounded-full text-destructive-foreground text-xs font-bold">
                <span className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
                EN DIRECT
              </span>
              <span className="text-white text-sm font-semibold truncate max-w-[200px]">
                {activeStream?.title}
              </span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <Minimize className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Normal video player */}
      <div ref={playerRef} className="relative bg-foreground aspect-video">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : embedUrl ? (
          <>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              style={{ border: "none", overflow: "hidden" }}
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
            {/* Overlay controls */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-destructive rounded-full text-destructive-foreground text-xs font-bold">
                <span className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
                EN DIRECT
              </span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors z-10"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary gap-3">
            <Tv className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center px-6">
              Aucun live en cours. Revenez plus tard !
            </p>
          </div>
        )}
      </div>

      {/* Stream info */}
      <div className="px-4 py-4">
        {activeStream && (
          <div className="bg-card rounded-xl p-4 shadow-card mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              {activeStream.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Diffusion en direct
            </p>
          </div>
        )}

        {streams.length > 1 && (
          <>
            <h3 className="font-display text-lg font-bold text-foreground mb-3">
              Autres diffusions
            </h3>
            {streams
              .filter((s) => s.id !== activeStream?.id)
              .map((stream) => (
                <motion.button
                  key={stream.id}
                  onClick={() => setActiveStream(stream)}
                  className="w-full flex items-center gap-3 p-3 bg-card rounded-xl shadow-card mb-2 text-left"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-destructive" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{stream.title}</p>
                    <p className="text-xs text-muted-foreground">En direct</p>
                  </div>
                </motion.button>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default LiveTVPage;
