import TopNavBar from "@/components/TopNavBar";
import FooterNavBar from "@/components/FooterNavBar";
import HomePage from "@/components/HomePage";


export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Нүүр хуудас",
};

export default function Home() {
  return (
    <div>
      <TopNavBar />
      <HomePage />
      <FooterNavBar />
    </div>
  );
}
