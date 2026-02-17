import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Mail, Heart, Syringe, Scissors } from "lucide-react";
import { useState } from "react";

const DogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: dog, isLoading } = useQuery({
    queryKey: ["dog", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("dogs").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: shelter } = useQuery({
    queryKey: ["shelter", dog?.shelter_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", dog!.shelter_id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!dog?.shelter_id,
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="container py-16 text-center">
        <p className="text-xl text-muted-foreground">Pas nije pronađen.</p>
        <Link to="/pretraga">
          <Button variant="link">Nazad na pretragu</Button>
        </Link>
      </div>
    );
  }

  const images = dog.images && dog.images.length > 0 ? dog.images : ["/placeholder.svg"];

  return (
    <div className="container py-8 space-y-6">
      <Link to="/pretraga">
        <Button variant="ghost" className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Nazad
        </Button>
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted">
            <img src={images[selectedImage]} alt={dog.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    i === selectedImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{dog.name}</h1>
            <p className="text-lg text-muted-foreground">{dog.breed}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{dog.size}</Badge>
            <Badge variant="outline">{dog.gender}</Badge>
            {dog.age && <Badge variant="secondary">{dog.age} god.</Badge>}
            {dog.location && (
              <Badge variant="outline" className="gap-1">
                <MapPin className="h-3 w-3" /> {dog.location}
              </Badge>
            )}
          </div>

          <div className="flex gap-4">
            {dog.is_vaccinated && (
              <div className="flex items-center gap-1.5 text-sm text-primary">
                <Syringe className="h-4 w-4" /> Vakcinisan
              </div>
            )}
            {dog.is_sterilized && (
              <div className="flex items-center gap-1.5 text-sm text-primary">
                <Scissors className="h-4 w-4" /> Sterilisan
              </div>
            )}
          </div>

          {dog.description && (
            <div>
              <h3 className="font-semibold mb-2">O meni</h3>
              <p className="text-muted-foreground leading-relaxed">{dog.description}</p>
            </div>
          )}

          {dog.health_status && (
            <div>
              <h3 className="font-semibold mb-2">Zdravstveno stanje</h3>
              <p className="text-muted-foreground">{dog.health_status}</p>
            </div>
          )}

          {/* Shelter Contact */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" /> Kontaktiraj azil
              </h3>
              {shelter && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {shelter.full_name && <p className="font-medium text-foreground">{shelter.full_name}</p>}
                  {shelter.phone && (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {shelter.phone}
                    </p>
                  )}
                  {shelter.city && (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {shelter.city}
                    </p>
                  )}
                </div>
              )}
              <a href={shelter?.phone ? `tel:${shelter.phone}` : "#"}>
                <Button className="w-full gap-2">
                  <Phone className="h-4 w-4" /> Kontaktiraj azil
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DogDetailPage;
