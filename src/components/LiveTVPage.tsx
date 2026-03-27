import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, Tv } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts a Facebook video embed URL from various FB link formats.
 */
const getFacebookEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  // Already an embed URL
  if (url.includes("facebook.com/plugins/video.php")) return url;
  // Encode the URL for the embed
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

  const embedUrl = activeStream ? getFacebookEmbedUrl(activeStream.facebook_url) : null;

  return (
    <div className="pb-20">
      {/* Video player area */}
      <div className="relative bg-foreground aspect-video">
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
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-destructive rounded-full text-destructive-foreground text-xs font-bold">
                <span className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
                EN DIRECT
              </span>
            </div>
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
              Diffusion en direct via Facebook Live
            </p>
          </div>
        )}

        {/* Other streams */}
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
                    <p className="text-xs text-muted-foreground">Facebook Live</p>
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
