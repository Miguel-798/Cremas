"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  IceCream, 
  Package, 
  ShoppingCart, 
  Calendar 
} from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Package;
}

interface HeaderProps {
  navItems?: NavItem[];
}

const defaultNavItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: Package },
  { href: "/cremas", label: "Cremas", icon: IceCream },
  { href: "/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/reservas", label: "Reservas", icon: Calendar },
];

/**
 * Header - Sticky header with logo, dark mode toggle, mobile hamburger drawer, and desktop nav
 */
export function Header({ navItems = defaultNavItems }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Focus trap in drawer
  useEffect(() => {
    if (isDrawerOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isDrawerOpen]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isDrawerOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-peach-400 to-peach-600 flex items-center justify-center shadow-lg">
                <IceCream className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-display font-semibold text-foreground">
                  Cremas
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Inventario</p>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle - always visible */}
              <DarkModeToggle />

              {/* Hamburger button - only visible on mobile */}
              {isMounted && (
                <button
                  onClick={toggleDrawer}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleDrawer();
                    }
                  }}
                  aria-label={isDrawerOpen ? "Cerrar menú" : "Abrir menú"}
                  aria-expanded={isDrawerOpen}
                  aria-controls="mobile-drawer"
                  className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <motion.div
                    animate={isDrawerOpen ? "open" : "closed"}
                    initial="closed"
                  >
                    {isDrawerOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </motion.div>
                </button>
              )}

              {/* Desktop navigation - hidden on mobile */}
              <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="Navegación principal">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              id="mobile-drawer"
              ref={drawerRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-72 bg-cream-50 dark:bg-espresso-900 border-r border-border z-50 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navegación"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-peach-400 to-peach-600 flex items-center justify-center">
                    <IceCream className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-display font-semibold text-foreground">
                    Menú
                  </span>
                </div>
                <button
                  ref={firstFocusableRef}
                  onClick={closeDrawer}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      closeDrawer();
                    }
                  }}
                  aria-label="Cerrar menú"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation */}
              <nav className="p-4 space-y-2" aria-label="Navegación móvil">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={item.href} onClick={closeDrawer}>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-secondary/50 transition-colors"
                        aria-label={item.label}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
