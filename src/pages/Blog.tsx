import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function Blog() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-sky to-background">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-12 max-w-4xl pt-24">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            📝 Блог
          </h1>
          <p className="text-xl text-muted-foreground">
            Скоро здесь появятся статьи о поэзии, музыке и нейросетях.
          </p>
        </div>

        <div className="text-center py-20 text-muted-foreground">
          Раздел в разработке. Следите за обновлениями!
        </div>
      </div>
      <Footer />
    </div>
  );
}
