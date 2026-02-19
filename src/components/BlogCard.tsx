import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { sr } from "date-fns/locale";

interface BlogCardProps {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export const BlogCard = ({ id, title, content, image_url, created_at }: BlogCardProps) => {
  const excerpt = content.length > 150 ? content.slice(0, 150) + "..." : content;

  return (
    <Link to={`/blog/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        {image_url && (
          <div className="aspect-video overflow-hidden">
            <img src={image_url} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardContent className="p-5 space-y-2">
          <p className="text-xs text-muted-foreground">
            {format(new Date(created_at), "d. MMMM yyyy.", { locale: sr })}
          </p>
          <h3 className="font-bold text-lg leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  );
};
