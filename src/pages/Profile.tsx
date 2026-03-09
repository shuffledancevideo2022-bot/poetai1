import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProfileSettings } from "@/components/ProfileSettings";
import { SubscriptionManagement } from "@/components/SubscriptionManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Settings, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { Navigate } from "react-router-dom";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { credits } = useCredits();
  const [activeTab, setActiveTab] = useState("profile");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Личный кабинет - PoetAI</title>
        <meta name="description" content="Управляйте своим профилем, настройками и подписками в PoetAI" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Profile Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  Личный кабинет
                </h1>
                <p className="text-muted-foreground">
                  Управляйте своим профилем и настройками
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Баланс кредитов
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{credits ?? 0}</div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium truncate">{user.email}</div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Статус
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium text-green-600">Активен</div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Профиль
                  </TabsTrigger>
                  <TabsTrigger value="subscription" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Подписка
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <ProfileSettings />
                </TabsContent>

                <TabsContent value="subscription" className="space-y-6">
                  <SubscriptionManagement />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}