import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Utensils, Gift, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

const tiers = [
  {
    title: "Mala Donacija",
    amount: "500 RSD",
    desc: "Pomozi sa hranom za jednog psa na nedelju dana.",
    icon: Utensils,
    color: "bg-blue-50 text-primary",
  },
  {
    title: "Velika Donacija",
    amount: "2.000 RSD",
    desc: "Obezbedi igračke i kvalitetnu hranu za azil.",
    icon: Gift,
    color: "bg-blue-100 text-primary",
    featured: true,
  },
  {
    title: "Herojska Donacija",
    amount: "5.000 RSD",
    desc: "Pokrij troškove veterinara i opreme za azil.",
    icon: Stethoscope,
    color: "bg-blue-50 text-primary",
  },
];

const DonationsPage = () => (
  <div className="container py-16 space-y-10">
    <div className="text-center space-y-3 max-w-xl mx-auto">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
        <Heart className="h-4 w-4" /> Donacije
      </div>
      <h1 className="text-3xl font-bold">Podrži napuštene pse</h1>
      <p className="text-muted-foreground">
        Svaka donacija pomaže da napušteni psi dobiju hranu, negu i šansu za novi dom.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {tiers.map((tier, i) => (
        <motion.div
          key={tier.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
        >
          <Card className={`text-center h-full flex flex-col ${tier.featured ? "border-primary shadow-lg scale-105" : ""}`}>
            <CardHeader className="pb-2">
              <div className={`mx-auto w-14 h-14 rounded-full ${tier.color} flex items-center justify-center mb-2`}>
                <tier.icon className="h-7 w-7" />
              </div>
              <CardTitle className="text-lg">{tier.title}</CardTitle>
              <p className="text-3xl font-extrabold text-primary">{tier.amount}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <p className="text-muted-foreground text-sm">{tier.desc}</p>
              <Button className="w-full">Doniraj</Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

export default DonationsPage;
