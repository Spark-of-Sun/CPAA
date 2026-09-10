'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.getMe().then(res => {
      if (res.ok) router.push('/dashboard');
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">CPAA</CardTitle>
          <CardDescription>Personal AI Agent Dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href={api.login()}>Sign in with Auth0</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
