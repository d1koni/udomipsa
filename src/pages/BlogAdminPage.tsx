import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit2, Plus } from "lucide-react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";

const BlogAdminPage = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  if (role !== "admin") return <Navigate to="/" replace />;

  const { data: posts } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase
          .from("blog_posts")
          .update({ title, content, image_url: imageUrl || null })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert({ title, content, image_url: imageUrl || null, author_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: editingId ? "Post ažuriran!" : "Post objavljen!" });
      resetForm();
    },
    onError: (e: any) => toast({ title: "Greška", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "Post obrisan." });
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImageUrl("");
    setEditingId(null);
  };

  const startEdit = (post: any) => {
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.image_url || "");
    setEditingId(post.id);
  };

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Blog Admin</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> {editingId ? "Izmeni post" : "Novi post"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Naslov" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="URL slike (opciono)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <Textarea placeholder="Sadržaj posta..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
          <div className="flex gap-2">
            <Button onClick={() => saveMutation.mutate()} disabled={!title || !content || saveMutation.isPending}>
              {editingId ? "Sačuvaj izmene" : "Objavi"}
            </Button>
            {editingId && <Button variant="outline" onClick={resetForm}>Otkaži</Button>}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Svi postovi</h2>
        {posts?.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(post.created_at), "d. MMMM yyyy.", { locale: srLatn })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => startEdit(post)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(post.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogAdminPage;
