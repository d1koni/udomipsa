import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { sr } from "date-fns/locale";

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="container py-8"><div className="h-96 bg-muted animate-pulse rounded-xl" /></div>;
  }

  if (!post) {
    return (
      <div className="container py-16 text-center">
        <p className="text-xl text-muted-foreground">Post nije pronađen.</p>
        <Link to="/blog"><Button variant="link">Nazad na blog</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl space-y-6">
      <Link to="/blog">
        <Button variant="ghost" className="gap-1"><ArrowLeft className="h-4 w-4" /> Nazad</Button>
      </Link>
      {post.image_url && (
        <div className="aspect-video rounded-xl overflow-hidden">
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {format(new Date(post.created_at), "d. MMMM yyyy.", { locale: sr })}
        </p>
        <h1 className="text-3xl font-bold">{post.title}</h1>
      </div>
      <div className="prose prose-neutral max-w-none">
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>
    </div>
  );
};

export default BlogPostPage;
