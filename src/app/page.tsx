"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCreams, useAlerts, useReservations } from "@/lib/queries";
import { useAuth } from "@/contexts/AuthContext";
import { 
  AlertTriangle, 
  ShoppingCart, 
  IceCream,
  ArrowRight,
  Plus
} from "lucide-react";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data: creams = [], isLoading: creamsLoading } = useCreams();
  const { data: alerts = { alerts: [], total: 0 }, isLoading: alertsLoading } = useAlerts();
  const { data: reservations = [], isLoading: reservationsLoading } = useReservations();

  const isLoading = authLoading || creamsLoading || alertsLoading || reservationsLoading;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth or redirecting
  if (isLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-peach-200 border-t-peach-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalStock = creams.reduce((acc, c) => acc + c.quantity, 0);

  const statCards = [
    {
      title: "Total Sabores",
      value: creams.length,
      subtitle: `${totalStock} unidades`,
      icon: IceCream,
      color: "from-peach-400 to-peach-600",
    },
    {
      title: "Stock Bajo",
      value: alerts.total,
      subtitle: "Necesitan reposición",
      icon: AlertTriangle,
      color: "from-red-400 to-red-600",
      alert: alerts.total > 0,
    },
    {
      title: "Reservas",
      value: reservations.length,
      subtitle: "Apartados activos",
      icon: ShoppingCart,
      color: "from-matcha-400 to-matcha-600",
    },
    {
      title: "Disponibles",
      value: creams.filter(c => c.quantity > 0).length,
      subtitle: "Con stock",
      icon: ShoppingCart,
      color: "from-cream-400 to-cream-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream-100 via-transparent to-transparent dark:from-espresso-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-peach-200/30 rounded-full blur-3xl dark:bg-peach-900/20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cream-200/30 rounded-full blur-3xl dark:bg-cream-900/20" />
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Grid - Responsive: 1 col mobile, 2 col sm, 4 col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${stat.color} shadow-soft group hover:shadow-soft-lg transition-all duration-300`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-white/80" />
                </div>
                <p className="text-2xl sm:text-3xl font-display font-bold text-white">{stat.value}</p>
                <p className="text-white/80 text-sm">{stat.title}</p>
                <p className="text-white/60 text-xs mt-1">{stat.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alerts Section */}
        <AnimatePresence>
          {alerts.total > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200/50 dark:border-red-800/50 p-5 sm:p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 dark:bg-red-900/20 rounded-full blur-2xl" />
                <div className="relative flex items-start gap-4">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 sm:w-6 h-5 sm:h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-red-800 dark:text-red-300 text-lg">
                      Alertas de Stock
                    </h3>
                    <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-3">
                      Las siguientes cremas necesitan reposición
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {alerts.alerts.map((alert: any) => (
                        <span
                          key={alert.cream_id}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm font-medium"
                        >
                          <IceCream className="w-3 h-3" />
                          {alert.flavor_name}
                          <span className="text-red-500">({alert.current_quantity})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Inventory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-foreground">
              Inventario Reciente
            </h2>
            <Link href="/cremas">
              <button className="flex items-center gap-1 text-sm text-peach-600 dark:text-peach-400 hover:text-peach-700 dark:hover:text-peach-300 transition-colors">
                Ver todas <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {creamsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : creams.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 sm:p-12 text-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 rounded-2xl bg-cream-100 dark:bg-espresso-800 flex items-center justify-center">
                <IceCream className="w-8 sm:w-10 h-8 sm:h-10 text-cream-400 dark:text-cream-600" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
                No hay cremas todavía
              </h3>
              <p className="text-muted-foreground mb-6">
                Agregá tu primer sabor para empezar
              </p>
              <Link href="/cremas">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-peach-500 text-white font-medium hover:bg-peach-600 transition-colors shadow-lg shadow-peach-500/25">
                  <Plus className="w-5 h-5" />
                  Agregar Crema
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {creams.slice(0, 4).map((cream, index) => (
                <motion.div
                  key={cream.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 hover:shadow-soft-lg hover:border-peach-200 dark:hover:border-peach-800 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-peach-400 to-cream-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cream-100 dark:bg-espresso-800 flex items-center justify-center">
                      <IceCream className="w-5 h-5 text-cream-600 dark:text-cream-400" />
                    </div>
                    {cream.is_low_stock && (
                      <span className="px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">
                        Bajo
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-display font-semibold text-foreground truncate">
                    {cream.flavor_name}
                  </h3>
                  <p className="text-3xl font-display font-bold text-peach-600 dark:text-peach-400 mt-2">
                    {cream.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">unidades</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
