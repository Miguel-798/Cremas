"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { creamsApi, reservationsApi } from "@/lib/api";
import { Calendar, ArrowLeft, IceCream, Check, X, User } from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";

export default function ReservasPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cream_id: "",
    quantity_reserved: 1,
    reserved_for: "",
    customer_name: "",
  });

  const { data: creams = [] } = useQuery({
    queryKey: ["creams"],
    queryFn: creamsApi.getAll,
  });

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: reservationsApi.getActive,
  });

  const createMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => reservationsApi.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["creams"] });
      setFormData({ cream_id: "", quantity_reserved: 1, reserved_for: "", customer_name: "" });
      setShowForm(false);
    },
  });

  const deliverMutation = useMutation({
    mutationFn: reservationsApi.deliver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["creams"] });
      alert("¡Reserva entregada! 🎉");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: reservationsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      alert("Reserva cancelada");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cream_id || !formData.reserved_for) return;
    createMutation.mutate({ id: formData.cream_id, data: formData });
  };

  const availableCreams = creams.filter((c) => c.quantity > 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-matcha-100 via-transparent to-transparent dark:from-matcha-900/20" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors" aria-label="Volver al inicio">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-display font-semibold text-foreground">
                  Reservas
                </h1>
                <p className="text-xs text-muted-foreground">Apartados activos</p>
              </div>
            </div>
            
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Add Button & Form */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-foreground">
              Apartados
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-matcha-500 text-white font-medium hover:bg-matcha-600 transition-colors shadow-lg shadow-matcha-500/25 w-full sm:w-auto"
            >
              <Calendar className="w-5 h-5" />
              Nuevo Apartado
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Sabor
                      </label>
                      <select
                        value={formData.cream_id}
                        onChange={(e) => setFormData({ ...formData, cream_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-matcha-500 transition-all"
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {availableCreams.map((cream) => (
                          <option key={cream.id} value={cream.id}>
                            {cream.flavor_name} ({cream.quantity})
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
                        value={formData.quantity_reserved}
                        onChange={(e) => setFormData({ ...formData, quantity_reserved: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-matcha-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Fecha de entrega
                      </label>
                      <input
                        type="date"
                        value={formData.reserved_for}
                        onChange={(e) => setFormData({ ...formData, reserved_for: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-matcha-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Cliente (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre del cliente"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-matcha-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="px-6 py-3 rounded-xl bg-matcha-500 text-white font-medium hover:bg-matcha-600 transition-colors disabled:opacity-50 w-full sm:w-auto"
                    >
                      {createMutation.isPending ? "Creando..." : "Crear Apartado"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors w-full sm:w-auto"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reservations List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-card border border-border rounded-2xl">
            <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 rounded-2xl bg-matcha-100 dark:bg-matcha-900/30 flex items-center justify-center">
              <Calendar className="w-8 sm:w-10 h-8 sm:h-10 text-matcha-500" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
              No hay apartados
            </h3>
            <p className="text-muted-foreground">
              Los apartados aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 hover:shadow-soft-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-matcha-400 to-matcha-600 flex items-center justify-center shrink-0">
                      <IceCream className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-foreground">
                        {reservation.cream_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(reservation.reserved_for)}
                        </span>
                        {reservation.customer_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {reservation.customer_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-14 sm:ml-0">
                    <div className="text-right shrink-0">
                      <p className="text-xl sm:text-2xl font-display font-bold text-matcha-600 dark:text-matcha-400">
                        {reservation.quantity_reserved}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">unidades</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => deliverMutation.mutate(reservation.id)}
                        disabled={deliverMutation.isPending}
                        className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        aria-label="Marcar como entregada"
                      >
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </button>
                      <button
                        onClick={() => cancelMutation.mutate(reservation.id)}
                        disabled={cancelMutation.isPending}
                        className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        aria-label="Cancelar reserva"
                      >
                        <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
