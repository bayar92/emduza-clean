"use client";
import TopNavBar from "@/components/TopNavBar";
import FooterNavBar from "@/components/FooterNavBar";
import HomePage from "@/components/HomePage";
import Head from "next/head";

const Home = () => {
  return (
    <div>
      <Head>
        <title>Нүүр хуудас</title>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <TopNavBar />
      <HomePage />
      <FooterNavBar />
    </div>
  );
};

export default Home;
