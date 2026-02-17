import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DogCard } from "@/components/DogCard";
import { Search, ShieldCheck, Phone, PawPrint, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

const Index = () => {
  const { data: featuredDogs } = useQuery({
    queryKey: ["featured-dogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const features = [
    { icon: Search, title: "Brza pretraga", desc: "Filtriraj po gradu, veličini i polu da pronađeš idealnog ljubimca." },
    { icon: ShieldCheck, title: "Provereni azili", desc: "Svi azili su verifikovani i pouzdani." },
    { icon: Phone, title: "Direktan kontakt", desc: "Kontaktiraj azil direktno putem aplikacije." },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
              <PawPrint className="h-4 w-4" /> Aplikacija za udomljavanje
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Pronađi svog{" "}
              <span className="text-primary">najboljeg prijatelja</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Pomozi napuštenom psu da pronađe dom pun ljubavi. Pregledaj pse iz proverenih azila širom Srbije.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/pretraga">
                <Button size="lg" className="gap-2">
                  Udomi odmah <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/donacije">
                <Button size="lg" variant="outline">
                  Doniraj
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="container py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center space-y-3 p-6 rounded-xl bg-card border"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Dogs */}
      {featuredDogs && featuredDogs.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Najnoviji psi</h2>
            <Link to="/pretraga">
              <Button variant="ghost" className="gap-1">
                Vidi sve <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
