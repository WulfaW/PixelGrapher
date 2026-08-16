import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border border-border">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive mt-0.5 shrink-0" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold">404 — Page Not Found</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
