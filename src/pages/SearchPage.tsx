import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DogCard } from "@/components/DogCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const SearchPage = () => {
  const [city, setCity] = useState("");
  const [size, setSize] = useState<string>("all");
  const [gender, setGender] = useState<string>("all");

  const { data: dogs, isLoading } = useQuery({
    queryKey: ["dogs", city, size, gender],
    queryFn: async () => {
      let query = supabase.from("dogs").select("*").order("created_at", { ascending: false });
      if (city.trim()) query = query.ilike("location", `%${city.trim()}%`);
      if (size !== "all") query = query.eq("size", size);
      if (gender !== "all") query = query.eq("gender", gender);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const clearFilters = () => {
    setCity("");
    setSize("all");
    setGender("all");
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Pretraga pasa</h1>
        <p className="text-muted-foreground">Pronađi svog budućeg ljubimca</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-card border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži po gradu..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={size} onValueChange={setSize}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Veličina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sve veličine</SelectItem>
            <SelectItem value="Mali">Mali</SelectItem>
            <SelectItem value="Srednji">Srednji</SelectItem>
            <SelectItem value="Veliki">Veliki</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Pol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Svi</SelectItem>
            <SelectItem value="Muški">Muški</SelectItem>
            <SelectItem value="Ženski">Ženski</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={clearFilters} title="Obriši filtere">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : dogs && dogs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nema pronađenih pasa za zadate filtere.</p>
          <Button variant="link" onClick={clearFilters}>Obriši filtere</Button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
