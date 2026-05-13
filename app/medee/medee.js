import React, { useState } from "react";
import { useRouter } from "next/router";
import TopNavBar from "../../../emduza/components/TopNavBar";
import FooterNavBar from "../../../emduza/components/FooterNavBar";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  let allNews = [];
  try {
    allNews = await prisma.news.findMany({
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
  }

  const serializedallNews = allNews.map((item) => ({
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
  }));

  return {
    props: {
      allNews: serializedallNews,
    },
  };
}

const AllNews = ({ allNews }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const itemsPerPage = 12;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allNews.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(allNews.length / itemsPerPage);

  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNewsClick = async (slug) => {
    setIsLoading(true);
    await router.push(`/medee/${slug}`);
  };

  return (
    <div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <Head>
        <title>Мэдээ, мэдээлэл</title>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <TopNavBar />
      <div className="container mx-auto flex flex-col pt-20">
        <h1 className="text-[16px] font-bold ml-8">Бүх мэдээ, мэдээллүүд</h1>
        <div className="bg-green-500 h-1 w-[190px] ml-8"></div>
      </div>
      <div className="container mx-auto mb-10">
        <section className="bg-white w-full">
          <div className="container mx-auto">
            <div className="flex flex-wrap">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <div key={item.id} className="w-full lg:w-1/4 p-4">
                    <a
                      onClick={() => handleNewsClick(item.slug)}
                      className="block shadow-lg rounded-lg overflow-hidden cursor-pointer"
                    >
                      <div className="relative w-[400px] h-[240px]">
                        <Image
                          src={`data:image/png;base64,${item.coverImage}`}
                          alt="News"
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="text-[14px] font-bold h-28">
                          {item.title}
                        </h3>
                        <div className="text-[12px] text-gray-500 mt-2 flex justify-between">
                          <span className="text-blue-500 hover:underline cursor-pointer">
                            Дэлгэрэнгүй унших
                          </span>
                          <span>
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </a>
                  </div>
                ))
              ) : (
                <p>No news available.</p>
              )}
            </div>
            <div className="flex justify-center mt-10">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handleClick(index + 1)}
                  className={`mx-2 px-4 py-2 border rounded ${
                    index + 1 === currentPage
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
      <FooterNavBar />
    </div>
  );
};

export default AllNews;
