import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DogCard } from "@/components/DogCard";
import { ArrowLeft, MapPin, Phone } from "lucide-react";

const ShelterProfilePage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: shelter, isLoading: shelterLoading } = useQuery({
    queryKey: ["shelter-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: dogs, isLoading: dogsLoading } = useQuery({
    queryKey: ["shelter-dogs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("shelter_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (shelterLoading) {
    return (
      <div className="container py-8">
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="container py-16 text-center">
        <p className="text-xl text-muted-foreground">Azil nije pronađen.</p>
        <Link to="/pretraga">
          <Button variant="link">Nazad na pretragu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <Link to="/pretraga">
        <Button variant="ghost" className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Nazad
        </Button>
      </Link>

      {/* Shelter Info */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">{shelter.full_name || "Azil"}</h1>
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          {shelter.city && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {shelter.city}
            </span>
          )}
          {shelter.phone && (
            <a href={`tel:${shelter.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" /> {shelter.phone}
            </a>
          )}
        </div>
      </div>

      {/* Dogs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Psi u azilu {dogs ? `(${dogs.length})` : ""}
        </h2>
        {dogsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : dogs && dogs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Ovaj azil trenutno nema objavljenih pasa.</p>
        )}
      </div>
    </div>
  );
};

export default ShelterProfilePage;
