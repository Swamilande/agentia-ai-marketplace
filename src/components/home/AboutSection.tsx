import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section className="py-24 lg:py-36 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block glass-card rounded-full px-5 py-1.5 text-xs font-medium tracking-widest uppercase text-primary mb-6">
            About
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-8">
            About <span className="text-gradient">Agentia</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Agentia is a modern AI marketplace where developers and businesses can discover, deploy, and scale
            intelligent agents with ease. We bridge the gap between complex AI models and production-ready
            applications, empowering teams to build the future faster.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
