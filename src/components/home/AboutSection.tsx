import { motion } from "framer-motion";
import { Bot, Shield, Zap, Globe, Clock, LineChart } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 Type II compliant. End-to-end encryption for all data.",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description: "Deploy any agent in under 60 seconds with one click.",
  },
  {
    icon: Globe,
    title: "Global Infrastructure",
    description: "Edge-optimized delivery across 200+ locations worldwide.",
  },
  {
    icon: Clock,
    title: "99.9% Uptime SLA",
    description: "Enterprise-grade reliability with automatic failover.",
  },
  {
    icon: LineChart,
    title: "Real-time Analytics",
    description: "Deep insights into agent performance and ROI metrics.",
  },
];

export function AboutSection() {
  return (
    <section className="py-24 lg:py-40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Built for
              <span className="text-gradient"> Enterprise</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Agentia is the trusted platform for deploying AI agents at scale. We handle the infrastructure, security, and optimization—so you can focus on driving business outcomes.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square">
              {/* Neural network visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-neural">
                  <svg className="w-full h-full" viewBox="0 0 400 400">
                    {/* Orbital rings */}
                    <circle cx="200" cy="200" r="150" fill="none" stroke="hsl(217 91% 60% / 0.1)" strokeWidth="1" />
                    <circle cx="200" cy="200" r="100" fill="none" stroke="hsl(217 91% 60% / 0.15)" strokeWidth="1" />
                    <circle cx="200" cy="200" r="50" fill="none" stroke="hsl(217 91% 60% / 0.2)" strokeWidth="1" />
                  </svg>
                </div>
              </div>

              {/* Center bot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="animate-pulse-glow"
                >
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30 backdrop-blur-xl">
                    <Bot className="h-16 w-16 text-primary" />
                  </div>
                </motion.div>
              </div>

              {/* Floating metric badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -top-4 -right-4 glass-card border border-foreground/10 p-4 rounded-2xl shadow-glow"
              >
                <p className="text-2xs text-muted-foreground uppercase tracking-widest mb-1">Agents Deployed</p>
                <p className="text-2xl font-black">1.2M+</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="absolute -bottom-4 -left-4 glass-card border border-foreground/10 p-4 rounded-2xl shadow-glow-purple"
              >
                <p className="text-2xs text-muted-foreground uppercase tracking-widest mb-1">Avg Response</p>
                <p className="text-2xl font-black text-green-400">23ms</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
