import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, X } from "lucide-react";
import { Navigate } from "react-router-dom";

interface DogForm {
  name: string;
  breed: string;
  age: string;
  size: string;
  gender: string;
  location: string;
  description: string;
  health_status: string;
  is_vaccinated: boolean;
  is_sterilized: boolean;
}

const emptyForm: DogForm = {
  name: "", breed: "Mešanac", age: "", size: "Srednji", gender: "Muški",
  location: "", description: "", health_status: "", is_vaccinated: false, is_sterilized: false,
};

const DashboardPage = () => {
  const { user, role, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DogForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: myDogs, isLoading } = useQuery({
    queryKey: ["my-dogs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("shelter_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("dog-images").upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("dog-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let images: string[] = [];
      if (imageFile) {
        const url = await uploadImage(imageFile);
        images = [url];
      }

      const dogData = {
        name: form.name,
        breed: form.breed,
        age: form.age ? parseInt(form.age) : null,
        size: form.size,
        gender: form.gender,
        location: form.location || null,
        description: form.description || null,
        health_status: form.health_status || null,
        is_vaccinated: form.is_vaccinated,
        is_sterilized: form.is_sterilized,
        shelter_id: user!.id,
        ...(images.length > 0 ? { images } : {}),
      };

      if (editingId) {
        const { error } = await supabase.from("dogs").update(dogData).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dogs").insert(dogData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editingId ? "Pas ažuriran!" : "Pas dodat!" });
      queryClient.invalidateQueries({ queryKey: ["my-dogs"] });
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      setImageFile(null);
    },
    onError: (e: Error) => {
      toast({ title: "Greška", description: e.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dogs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Pas obrisan." });
      queryClient.invalidateQueries({ queryKey: ["my-dogs"] });
    },
  });

  const startEdit = (dog: any) => {
    setForm({
      name: dog.name, breed: dog.breed, age: dog.age?.toString() || "",
      size: dog.size, gender: dog.gender, location: dog.location || "",
      description: dog.description || "", health_status: dog.health_status || "",
      is_vaccinated: dog.is_vaccinated || false, is_sterilized: dog.is_sterilized || false,
    });
    setEditingId(dog.id);
    setShowForm(true);
  };

  if (loading) return <div className="container py-16 text-center">Učitavanje...</div>;
  if (!user || role !== "shelter") return <Navigate to="/auth" replace />;

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel azila</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} className="gap-1">
          {showForm ? <><X className="h-4 w-4" /> Zatvori</> : <><Plus className="h-4 w-4" /> Dodaj psa</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Izmeni psa" : "Dodaj novog psa"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ime *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Rasa</Label>
                <Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Starost (godine)</Label>
                <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Veličina</Label>
                <Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mali">Mali</SelectItem>
                    <SelectItem value="Srednji">Srednji</SelectItem>
                    <SelectItem value="Veliki">Veliki</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pol</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Muški">Muški</SelectItem>
                    <SelectItem value="Ženski">Ženski</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Grad</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Opis</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Zdravstveno stanje</Label>
                <Input value={form.health_status} onChange={(e) => setForm({ ...form, health_status: e.target.value })} />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_vaccinated} onCheckedChange={(v) => setForm({ ...form, is_vaccinated: v })} />
                  <Label>Vakcinisan</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_sterilized} onCheckedChange={(v) => setForm({ ...form, is_sterilized: v })} />
                  <Label>Sterilisan</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fotografija</Label>
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Čuvanje..." : editingId ? "Sačuvaj izmene" : "Dodaj psa"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Dog list */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Moji psi ({myDogs?.length || 0})</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : myDogs && myDogs.length > 0 ? (
          <div className="space-y-3">
            {myDogs.map((dog) => (
              <Card key={dog.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <img
                    src={dog.images?.[0] || "/placeholder.svg"}
                    alt={dog.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{dog.name}</p>
                    <p className="text-sm text-muted-foreground">{dog.breed} · {dog.size} · {dog.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => startEdit(dog)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(dog.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Još niste dodali nijednog psa.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
