"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { creamsApi, salesApi } from "@/lib/api";
import { ShoppingCart, ArrowLeft, IceCream, Check, TrendingUp, Calendar, Clock } from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { useAuth } from "@/contexts/AuthContext";

export default function VentasPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCream, setSelectedCream] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showRegister, setShowRegister] = useState(true);
  const [view, setView] = useState<"register" | "history">("register");

  const { data: creams = [] } = useQuery({
    queryKey: ["creams"],
    queryFn: creamsApi.getAll,
    staleTime: 60 * 1000,
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: salesApi.getAll,
    staleTime: 30 * 1000,
  });

  const saleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => salesApi.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creams"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setSelectedCream("");
      setQuantity(1);
      alert("¡Venta registrada! 🎉");
    },
    onError: (error: any) => {
      alert(error.message || "Error al registrar venta");
    },
  });

  const handleSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCream) return;

    const cream = creams.find((c) => c.id === selectedCream);
    if (!cream) return;

    if (quantity > cream.quantity) {
      alert(`Stock insuficiente. Disponible: ${cream.quantity}`);
      return;
    }

    saleMutation.mutate({
      id: cream.id,
      data: { cream_id: cream.id, quantity_sold: quantity },
    });
  };

  const availableCreams = creams.filter((c) => c.quantity > 0);
  const selected = creams.find((c) => c.id === selectedCream);

  // Redirect if not logged in (after all hooks)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth
  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-peach-200 border-t-peach-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Sales stats
  const totalVentas = sales.reduce((acc, s) => acc + s.quantity_sold, 0);
  const ventasHoy = sales.filter((s) => {
    const hoy = new Date().toDateString();
    return new Date(s.sold_at).toDateString() === hoy;
  });

  // Group sales by date
  const salesByDate = sales.reduce((acc, sale) => {
    const date = new Date(sale.sold_at).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(sale);
    return acc;
  }, {} as Record<string, typeof sales>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Background 
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-peach-100 via-transparent to-transparent /20" />
      </div>*/}
          <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream-100 via-transparent to-transparent dark:from-espresso-900/20"></div>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-peach-200/30 rounded-full blur-3xl dark:bg-peach-900/20"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cream-200/30 rounded-full blur-3xl dark:bg-cream-900/20"></div>
          </div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors" aria-label="Volver al inicio">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-display font-semibold text-foreground">
                  Ventas
                </h1>
                <p className="text-xs text-muted-foreground">Registro e historial</p>
              </div>
            </div>
            
            
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 py-2">
            <button
              onClick={() => setView("register")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === "register"
                  ? "bg-peach-500 text-white"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Registrar Venta
            </button>
            <button
              onClick={() => setView("history")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                view === "history"
                  ? "bg-matcha-500 text-white"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Clock className="w-4 h-4" />
              Historial
              {sales.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  view === "history" ? "bg-white/20" : "bg-secondary"
                }`}>
                  {sales.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {view === "register" ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats - Responsive grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-peach-400 to-peach-600 rounded-2xl p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm opacity-80">Total</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-display font-bold">{totalVentas}</p>
                </div>

                <div className="bg-gradient-to-br from-matcha-400 to-matcha-600 rounded-2xl p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm opacity-80">Hoy</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-display font-bold">
                    {ventasHoy.reduce((acc, s) => acc + s.quantity_sold, 0)}
                  </p>
                </div>
              </div>

              {/* Register Form */}
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-peach-400 to-peach-600 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-display font-semibold text-foreground">
                      Nueva Venta
                    </h2>
                    <p className="text-sm text-muted-foreground hidden sm:block">
                      Seleccioná el sabor y cantidad
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSale} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Sabor
                    </label>
                    <select
                      value={selectedCream}
                      onChange={(e) => setSelectedCream(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-peach-500 transition-all"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {availableCreams.map((cream) => (
                        <option key={cream.id} value={cream.id}>
                          {cream.flavor_name} ({cream.quantity} disponibles)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-peach-500 transition-all"
                      required
                    />
                  </div>

                  {selected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-cream-50 /50 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cream-200  flex items-center justify-center shrink-0">
                            <IceCream className="w-5 h-5 text-espresso-700 " />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{selected.flavor_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Stock: {selected.quantity} unidades
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-xl sm:text-2xl font-display font-bold text-peach-600 ">
                            {quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">vender</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={saleMutation.isPending || !selectedCream}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-peach-500 to-peach-600 text-white font-medium hover:from-peach-600 hover:to-peach-700 transition-all disabled:opacity-50 shadow-lg shadow-peach-500/25 flex items-center justify-center gap-2"
                  >
                    {saleMutation.isPending ? (
                      "Registrando..."
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Registrar Venta
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Available */}
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">
                  Cremas disponibles
                </h3>
                {availableCreams.length === 0 ? (
                  <div className="text-center py-8 bg-card border border-border rounded-2xl">
                    <IceCream className="w-10 sm:w-12 h-10 sm:h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No hay cremas disponibles</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:md:grid-cols-4 gap-3">
                    {availableCreams.map((cream) => (
                      <div
                        key={cream.id}
                        className={`bg-card border border-border rounded-xl p-3 sm:p-4 text-center cursor-pointer transition-all hover:border-peach-300 :border-peach-700 ${
                          selectedCream === cream.id ? "border-peach-500 ring-2 ring-peach-500/20" : ""
                        }`}
                        onClick={() => setSelectedCream(cream.id)}
                      >
                        <IceCream className="w-5 sm:w-6 h-5 sm:h-6 mx-auto mb-2 text-cream-500" />
                        <p className="font-medium text-foreground text-sm truncate">{cream.flavor_name}</p>
                        <p className="text-xl sm:text-2xl font-display font-bold text-peach-600 ">{cream.quantity}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-peach-400 to-peach-600 rounded-2xl p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm opacity-80">Total Vendidas</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-display font-bold">{totalVentas}</p>
                  <p className="text-sm opacity-80">unidades</p>
                </div>

                <div className="bg-gradient-to-br from-matcha-400 to-matcha-600 rounded-2xl p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm opacity-80">Hoy</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-display font-bold">
                    {ventasHoy.reduce((acc, s) => acc + s.quantity_sold, 0)}
                  </p>
                  <p className="text-sm opacity-80">unidades</p>
                </div>
              </div>

              {/* Sales List */}
              <h2 className="font-display font-semibold text-foreground mb-4">
                Historial de Ventas
              </h2>

              {salesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-card animate-pulse" />
                  ))}
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-card border border-border rounded-2xl">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 rounded-2xl bg-cream-100  flex items-center justify-center">
                    <ShoppingCart className="w-8 sm:w-10 h-8 sm:h-10 text-cream-400 " />
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
                    Sin ventas registradas
                  </h3>
                  <p className="text-muted-foreground">
                    Las ventas aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(salesByDate)
                    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                    .map(([date, dateSales], dateIndex) => (
                      <motion.div
                        key={date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: dateIndex * 0.05 }}
                      >
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                          {new Date(date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </h3>
                        
                        <div className="space-y-2">
                          {dateSales
                            .sort((a, b) => new Date(b.sold_at).getTime() - new Date(a.sold_at).getTime())
                            .map((sale) => (
                              <div
                                key={sale.id}
                                className="bg-card border border-border rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cream-200 to-cream-300   flex items-center justify-center shrink-0">
                                    <IceCream className="w-5 h-5 text-espresso-700 " />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-foreground truncate">{sale.cream_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(sale.sold_at).toLocaleTimeString("es-ES", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-lg sm:text-xl font-display font-bold text-peach-600 ">
                                    {sale.quantity_sold}
                                  </p>
                                  <p className="text-xs text-muted-foreground hidden sm:block">unidades</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
