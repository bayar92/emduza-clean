import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TopNavBar from '../../../emduza/components/TopNavBar';
import FooterNavBar from '../../../emduza/components/FooterNavBar';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import Head from 'next/head';
import Image from 'next/image';

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const sessionNews = await prisma.news.findMany({
    where: { category: 'ЭМДҮЗ-ийн хуралдаан, хуралдааны тойм' },
  });

  const serializedallNews = sessionNews.map((item) => ({
    ...item,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
  }));

  const latestNews = await prisma.news.findMany({
    orderBy: { date: 'desc' },
    take: 5,
  });

  latestNews.forEach((item) => {
    item.date = item.date.toISOString();
    item.createdAt = item.createdAt.toISOString();
  });

  return {
    props: {
      sessionNews: serializedallNews,
      latestNews,
    },
  };
}

const SessionNews = ({ sessionNews, latestNews }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    setHydrated(true);
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sessionNews.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sessionNews.length / itemsPerPage);

  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!hydrated) {
    return null;
  }

  return (
    <div>
      <Head>
        <title>ЭМДҮЗ-ийн хуралдаан, хуралдааны тойм</title>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <TopNavBar />
      <div className="container mx-auto mt-20 flex mb-20">
        <div className="w-2/3 mt-4">
          <h1 className="text-[16px] font-bold ml-4">
            ЭМДҮЗ-ийн хуралдаан, хуралдааны тойм
          </h1>
          <div className="bg-green-500 h-1 w-[410px] mb-2 ml-4"></div>
          <section className="bg-white w-full">
            <div className="mx-auto">
              <div className="flex flex-wrap">
                {currentItems.map((item) => (
                  <div key={item.id} className="w-full lg:w-1/3 p-4">
                    <Link href={`/medee/${item.slug}`} legacyBehavior>
                      <a className="block shadow-lg rounded-lg overflow-hidden">
                        <div className="relative w-full h-[256px]">
                          <Image
                            src={`data:image/png;base64,${item.coverImage}`}
                            alt="News"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-[14px] font-bold h-20">
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
                    </Link>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-6">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handleClick(index + 1)}
                    className={`mx-2 px-4 py-2 border rounded ${
                      index + 1 === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-blue-500'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
        <div className="w-1/4 ml-10 mt-4">
          <div className="sticky">
            <h1 className="text-l font-bold">Сүүлд нэмэгдсэн мэдээлэл</h1>
            <div className="bg-green-500 h-1 w-[220px] mb-6"></div>
            {latestNews.map((item) => (
              <div key={item.id} className="flex mb-4">
                <Link href={`/medee/${item.slug}`} legacyBehavior>
                  <a className="flex">
                    <Image
                      src={`data:image/png;base64,${item.coverImage}`}
                      alt="News"
                      width={96}
                      height={96}
                      className="object-cover mr-4 rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold h-[85px] text-[12px]">
                        {item.title}
                      </h3>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <a className="text-blue-500 hover:underline cursor-pointer">
                          Дэлгэрэнгүй унших
                        </a>
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FooterNavBar />
    </div>
  );
};

export default SessionNews;
