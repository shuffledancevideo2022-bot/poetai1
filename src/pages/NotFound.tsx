import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Страница не найдена</p>
          <Link to="/" className="text-primary underline hover:text-primary/80 transition-colors">
            Вернуться на главную
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
