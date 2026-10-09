'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase/client';
import { Package, ShoppingBag, LogOut, LayoutDashboard, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !pathname.includes('/admin/login')) {
        router.push('/admin/login');
      } else if (session && pathname.includes('/admin/login')) {
        router.push('/admin/dashboard');
      } else {
        setIsAuthenticated(!!session);
      }
      setIsLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        if (pathname.includes('/admin/login')) router.push('/admin/dashboard');
      }
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-background">Cargando...</div>;
  }

  // Si estamos en login, no mostramos el sidebar
  if (pathname.includes('/admin/login')) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-primary">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === '/admin/dashboard' ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:bg-gray-100 hover:text-text-main'}`}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === '/admin/products' ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:bg-gray-100 hover:text-text-main'}`}>
            <Package className="h-5 w-5" />
            Productos
          </Link>
          <Link href="/admin/combos" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname?.includes('/admin/combos') ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:bg-gray-100 hover:text-text-main'}`}>
            <Package className="h-5 w-5" />
            Combos Promocionales
          </Link>
          <Link href="/admin/orders" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === '/admin/orders' ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:bg-gray-100 hover:text-text-main'}`}>
            <ShoppingBag className="h-5 w-5" />
            Pedidos
          </Link>
          <Link href="/admin/retention" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === '/admin/retention' ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:bg-gray-100 hover:text-text-main'}`}>
            <Users className="h-5 w-5" />
            Retención de Clientes
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-md text-danger hover:bg-red-50 transition-colors">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
