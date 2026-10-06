'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return <div className="flex h-screen items-center justify-center">Redirigiendo...</div>;
}
