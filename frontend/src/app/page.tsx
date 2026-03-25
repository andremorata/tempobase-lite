import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">TempoBase</h1>
        <p className="text-muted-foreground text-lg">
          Your time, quantified and clear.
        </p>
      </div>
      <div className="flex gap-4">
        <Button nativeButton={false} render={<Link href="/login" />}>Sign in</Button>
        <Button nativeButton={false} variant="outline" render={<Link href="/tracker" />}>
          Go to Tracker
        </Button>
      </div>
    </main>
  );
}