import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface DogCardProps {
  dog: Tables<"dogs">;
}

export const DogCard = ({ dog }: DogCardProps) => {
  const imageUrl = dog.images && dog.images.length > 0
    ? dog.images[0]
    : "/placeholder.svg";

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={dog.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{dog.name}</h3>
          <Badge variant="secondary">{dog.size}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{dog.breed}</p>
        {dog.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {dog.location}
          </div>
        )}
        <Link to={`/pas/${dog.id}`}>
          <Button className="w-full mt-2" size="sm">Pogledaj profil</Button>
        </Link>
      </CardContent>
    </Card>
  );
};
