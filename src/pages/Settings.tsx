import React from 'react';
import Header from "@/components/layout/Header";
import { ThemeDemo } from "@/components/branding/ThemeDemo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Customize your experience and manage your preferences.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeDemo />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;