import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Spline from "@splinetool/react-spline";
import { Suspense } from "react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden min-h-[90vh] flex items-center">
      {/* Spline 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
          <div className="w-full h-full [&>canvas]:!pointer-events-none">
            <Spline
              scene="https://prod.spline.design/nexbotbyaximoriscopycopy-3WMCqH0PMu4zv7afcsEglLUM/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </Suspense>
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Badge variant="info" className="mb-8">
              <Zap className="h-3 w-3 mr-1.5" />
              The Future of AI Automation
            </Badge>
          </motion.div>

          <h1 className="text-5xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="block drop-shadow-lg"
            >
              Deploy AI Agents
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="block text-gradient drop-shadow-lg"
            >
              In Seconds
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-xl lg:text-2xl text-muted-foreground font-light max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-sm"
          >
            The premier marketplace for production-ready AI agents. From customer support to sales automation—find, deploy, and scale intelligent solutions instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/marketplace">
              <Button variant="hero" className="group">
                Explore Marketplace
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button variant="hero-outline">
                Start Building
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-16 flex flex-wrap justify-center gap-8 lg:gap-16"
          >
            {[
              { icon: Shield, label: "Enterprise Security" },
              { icon: BarChart3, label: "Real-time Analytics" },
              { icon: Clock, label: "99.9% Uptime" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
