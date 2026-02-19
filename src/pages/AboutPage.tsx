import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users } from "lucide-react";
import { motion } from "framer-motion";

const team = [
  { name: "Dimitrije Stanojević", role: "Osnivač & Developer" },
  { name: "Uroš Dragutinović", role: "Osnivač & Designer" },
];

const AboutPage = () => (
  <div className="container py-16 space-y-16">
    {/* Mission */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center space-y-4"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
        <Heart className="h-4 w-4" /> O nama
      </div>
      <h1 className="text-3xl font-bold">Naša misija</h1>
      <p className="text-muted-foreground leading-relaxed">
        Verujemo da svaki pas zaslužuje topao dom i ljubav. Naša platforma povezuje azile za životinje
        sa ljudima koji žele da udome psa i pruže mu bolji život. Zajedno možemo smanjiti broj
        napuštenih životinja i stvoriti srećniju zajednicu.
      </p>
    </motion.div>

    {/* Team */}
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium mb-3">
          <Users className="h-4 w-4" /> Tim
        </div>
        <h2 className="text-2xl font-bold">Upoznaj naš tim</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 max-w-lg mx-auto">
        {team.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="text-center">
              <CardContent className="pt-6 space-y-2">
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-2xl font-bold text-primary">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default AboutPage;
