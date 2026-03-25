"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { creamsApi, CreamUpdate } from "@/lib/api";
import { IceCream, Plus, Trash2, ArrowLeft, X, Check, Pencil } from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { useAuth } from "@/contexts/AuthContext";

export default function CremasPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ flavor_name: "", quantity: 0 });
  const [price, setPrice] = useState<number>(5000);
  
  // Edit modal state
  const [editingCream, setEditingCream] = useState<{id: string; flavor_name: string; quantity: number; price: number} | null>(null);
  const [editFormData, setEditFormData] = useState({ flavor_name: "", quantity: 0, price: 0 });

  const { data: creams = [], isLoading } = useQuery({
    queryKey: ["creams"],
    queryFn: creamsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: { flavor_name: string; quantity: number; price?: number }) =>
      creamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creams"] });
      setFormData({ flavor_name: "", quantity: 0 });
      setPrice(5000);
      setShowForm(false);
    },
  });

  const addStockMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      creamsApi.addStock(id, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creams"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: creamsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creams"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreamUpdate }) =>
      creamsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creams"] });
      setEditingCream(null);
    },
  });

  // Redirect if not logged in (after hooks)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.flavor_name.trim()) return;
    createMutation.mutate({ ...formData, price });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Background 
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream-100 via-transparent to-transparent /20" />
      </div>*/}
          <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream-100 via-transparent to-transparent dark:from-espresso-900/20"></div>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-peach-200/30 rounded-full blur-3xl dark:bg-peach-900/20"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cream-200/30 rounded-full blur-3xl dark:bg-cream-900/20"></div>
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
                  Cremas
                </h1>
                <p className="text-xs text-muted-foreground">Gestión de inventario</p>
              </div>
            </div>
            
            
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Add Button & Form */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-foreground">
              Tus Sabores
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-peach-500 text-white font-medium hover:bg-peach-600 transition-colors shadow-lg shadow-peach-500/25 w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              Nuevo Sabor
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
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Nombre del sabor
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Chocolate, Vainilla, Oreo..."
                        value={formData.flavor_name}
                        onChange={(e) => setFormData({ ...formData, flavor_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-peach-500 transition-all"
                        required
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-peach-500 transition-all"
                      />
                    </div>
                    <div className="w-full md:w-40">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Precio (COP)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="5000"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-peach-500 transition-all"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-end gap-2">
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-6 py-3 rounded-xl bg-peach-500 text-white font-medium hover:bg-peach-600 transition-colors disabled:opacity-50 w-full sm:w-auto"
                      >
                        {createMutation.isPending ? "Creando..." : "Crear"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors w-full sm:w-auto"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cremas Grid - Responsive: 1 col mobile, 2 col sm, 3 col md, 4 col lg */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : creams.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-6 rounded-3xl bg-cream-100  flex items-center justify-center">
              <IceCream className="w-10 sm:w-12 h-10 sm:h-12 text-cream-400 " />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2">
              Sin sabores aún
            </h3>
            <p className="text-muted-foreground">
              Agregá tu primera crema para comenzar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {creams.map((cream, index) => (
              <motion.div
                key={cream.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-card border border-border rounded-2xl p-4 sm:p-5 hover:shadow-soft-lg hover:border-peach-200 :border-peach-800 transition-all duration-300"
              >
                {/* Delete button */}
                <button
                  onClick={() => deleteMutation.mutate(cream.id)}
                  disabled={deleteMutation.isPending}
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-red-100 /30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 :bg-red-900/50"
                  aria-label={`Eliminar ${cream.flavor_name}`}
                >
                  <Trash2 className="w-4 h-4 text-red-600 " />
                </button>

                {/* Edit button */}
                <button
                  onClick={() => {
                    setEditingCream({
                      id: cream.id,
                      flavor_name: cream.flavor_name,
                      quantity: cream.quantity,
                      price: cream.price,
                    });
                    setEditFormData({
                      flavor_name: cream.flavor_name,
                      quantity: cream.quantity,
                      price: cream.price,
                    });
                  }}
                  className="absolute top-3 right-12 w-8 h-8 rounded-lg bg-blue-100 /30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-200 :bg-blue-900/50"
                  aria-label={`Editar ${cream.flavor_name}`}
                >
                  <Pencil className="w-4 h-4 text-blue-600 " />
                </button>

                {/* Content */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-cream-200 to-cream-300   flex items-center justify-center shrink-0">
                    <IceCream className="w-5 sm:w-6 h-5 sm:h-6 text-espresso-700 " />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground truncate">
                      {cream.flavor_name}
                    </h3>
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${
                      cream.is_low_stock 
                        ? "bg-red-100 text-red-600 /30 " 
                        : "bg-green-100 text-green-600 /30 "
                    }`}>
                      {cream.is_low_stock ? "Stock bajo" : "En stock"}
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="text-center py-3 bg-cream-50 /50 rounded-xl">
                  <p className="text-3xl sm:text-4xl font-display font-bold text-peach-600 ">
                    {cream.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">unidades</p>
                </div>

                {/* Add Stock */}
                <button
                  onClick={() => {
                    const amount = prompt("¿Cuántas agregar?", "1");
                    if (amount && Number(amount) > 0) {
                      addStockMutation.mutate({ id: cream.id, amount: Number(amount) });
                    }
                  }}
                  className="w-full mt-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Stock
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingCream && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingCream(null)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setEditingCream(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                Editar Sabor
              </h2>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateMutation.mutate({
                    id: editingCream.id,
                    data: {
                      flavor_name: editFormData.flavor_name,
                      quantity: editFormData.quantity,
                      price: editFormData.price,
                    },
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nombre del sabor
                  </label>
                  <input
                    type="text"
                    value={editFormData.flavor_name}
                    onChange={(e) => setEditFormData({ ...editFormData, flavor_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-peach-500 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({ ...editFormData, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-peach-500 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Precio (COP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-peach-500 transition-all"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 py-3 rounded-xl bg-peach-500 text-white font-medium hover:bg-peach-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {updateMutation.isPending ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCream(null)}
                    className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
