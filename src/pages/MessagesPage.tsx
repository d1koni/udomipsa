import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChatWindow } from "@/components/ChatWindow";
import { Card, CardContent } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";

const MessagesPage = () => {
  const { user, loading } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`adopter_id.eq.${user!.id},shelter_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch related data for display
  const otherUserIds = conversations?.map((c) =>
    c.adopter_id === user?.id ? c.shelter_id : c.adopter_id
  ) ?? [];
  const dogIds = conversations?.map((c) => c.dog_id).filter(Boolean) ?? [];

  const { data: profiles } = useQuery({
    queryKey: ["conv-profiles", otherUserIds],
    queryFn: async () => {
      if (otherUserIds.length === 0) return [];
      const { data } = await supabase.from("profiles").select("id, full_name").in("id", otherUserIds);
      return data ?? [];
    },
    enabled: otherUserIds.length > 0,
  });

  const { data: dogs } = useQuery({
    queryKey: ["conv-dogs", dogIds],
    queryFn: async () => {
      if (dogIds.length === 0) return [];
      const { data } = await supabase.from("dogs").select("id, name").in("id", dogIds as string[]);
      return data ?? [];
    },
    enabled: dogIds.length > 0,
  });

  const getName = (id: string) => profiles?.find((p) => p.id === id)?.full_name || "Korisnik";
  const getDogName = (id: string | null) => id ? dogs?.find((d) => d.id === id)?.name : null;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Poruke</h1>
      <div className="grid md:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-14rem)]">
        {/* Conversations list */}
        <div className="space-y-2 overflow-y-auto">
          {conversations?.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">Nemate poruka.</p>
          )}
          {conversations?.map((conv) => {
            const otherId = conv.adopter_id === user?.id ? conv.shelter_id : conv.adopter_id;
            const dogName = getDogName(conv.dog_id);
            return (
              <Card
                key={conv.id}
                className={`cursor-pointer transition-colors ${selectedId === conv.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                onClick={() => setSelectedId(conv.id)}
              >
                <CardContent className="p-3">
                  <p className="font-medium text-sm">{getName(otherId)}</p>
                  {dogName && <p className="text-xs text-muted-foreground">🐾 {dogName}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chat */}
        <Card className="flex flex-col overflow-hidden">
          {selectedId ? (
            <ChatWindow conversationId={selectedId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageSquare className="h-10 w-10 mx-auto opacity-50" />
                <p>Izaberite konverzaciju</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
