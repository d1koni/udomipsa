import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DogCard } from "@/components/DogCard";
import { Heart } from "lucide-react";
import { Navigate } from "react-router-dom";

const FavoritesPage = () => {
  const { user, role, loading } = useAuth();

  const { data: favoriteDogs, isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      const { data: favs, error: favError } = await supabase
        .from("favorites")
        .select("dog_id")
        .eq("user_id", user!.id);
      if (favError) throw favError;
      if (!favs.length) return [];

      const dogIds = favs.map((f) => f.dog_id);
      const { data: dogs, error } = await supabase
        .from("dogs")
        .select("*")
        .in("id", dogIds);
      if (error) throw error;
      return dogs;
    },
    enabled: !!user,
  });

  if (loading) return <div className="container py-16 text-center">Učitavanje...</div>;
  if (!user || role !== "adopter") return <Navigate to="/auth" replace />;

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Omiljeni psi</h1>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : favoriteDogs && favoriteDogs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-16">
          Još niste dodali nijednog psa u omiljene.
        </p>
      )}
    </div>
  );
};

export default FavoritesPage;
