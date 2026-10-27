import { Header } from "@/components/Header/Header";
import { Hero } from "@/components/Hero/Hero";
import { Services } from "@/components/Services/Services";
import { Projects } from "@/components/Projects/Projects";
import { Process } from "@/components/Process/Process";
import { Contact } from "@/components/Contact/Contact";
import { Footer } from "@/components/Footer/Footer";

export default function App() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <Projects />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}