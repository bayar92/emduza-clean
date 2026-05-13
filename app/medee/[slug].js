import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TopNavBar from '@/components/TopNavBar';
import FooterNavBar from '@/components/FooterNavBar';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Slider from 'react-slick';

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const news = await prisma.news.findUnique({
    where: { slug },
  });

  if (news) {
    news.date = news.date.toISOString();
    news.createdAt = news.createdAt ? news.createdAt.toISOString() : null;
    news.images = news.images.map((image) => image.toString('base64'));
    news.content = Buffer.from(news.content).toString('utf-8');
  }

  const latestNews = await prisma.news.findMany({
    orderBy: { date: 'desc' },
    take: 5,
  });

  latestNews.forEach((item) => {
    item.date = item.date.toISOString();
    item.createdAt = item.createdAt ? item.createdAt.toISOString() : null;
  });

  return {
    props: {
      news,
      latestNews,
    },
  };
}

const NewsDetail = ({ news, latestNews }) => {
  const [sanitizedContent, setSanitizedContent] = useState(news.content);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('dompurify').then((DOMPurifyModule) => {
        const DOMPurify = DOMPurifyModule.default;
        setSanitizedContent(DOMPurify.sanitize(news.content));
      });
    }
  }, [news.content]);

  useEffect(() => {
    if (latestNews) {
      setIsLoading(false);
    }
  }, [latestNews]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?newsId=${news.id}`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [news.id]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          content: comment,
          newsId: news.id,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prevComments) => [newComment, ...prevComments]);
        setComment('');
        setName('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });
      if (response.ok) {
        const updatedComment = await response.json();
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, likes: updatedComment.likes }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDislike = async (commentId) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/dislike`, {
        method: 'POST',
      });
      if (response.ok) {
        const updatedComment = await response.json();
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, dislikes: updatedComment.dislikes }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error disliking comment:', error);
    }
  };

  if (!news) {
    return <div>Мэдээ олдсонгүй.</div>;
  }

  return (
    <div>
      <TopNavBar />
      <div className="container mx-auto mt-14 p-4 flex mb-20">
        <div className="w-2/3 mt-4">
          <h1 className="text-2xl font-bold mb-6 ml-10 mt-6 w-[950px]">
            {news.title}
          </h1>
          <p className="text-right mb-4">
            Нийтэлсэн огноо:{' '}
            {new Intl.DateTimeFormat('en-GB', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
              .format(new Date(news.date))
              .split('/')
              .reverse()
              .join('/')}
          </p>

          <Image
            src={`data:image/png;base64,${news.coverImage}`}
            alt="Cover Image"
            width={1000}
            height={600}
            className="object-contain h-[550px] w-full mb-4 rounded-lg"
          />
          <div
            className="mt-2 mb-2"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
          <br />
          <Slider {...sliderSettings}>
            {news.images.map((image, index) => (
              <div key={index}>
                <Image
                  src={`data:image/png;base64,${image}`}
                  alt={`Image ${index + 1}`}
                  width={800}
                  height={450}
                  className="object-contain h-[550px] w-full rounded-lg"
                />
              </div>
            ))}
          </Slider>

          <div className="mt-16">
            <h3 className="text-xl font-semibold ">
              Сэтгэгдэлүүд ({comments.length})
            </h3>
            <div className="bg-green-500 h-1 w-[170px] mb-4"></div>
            <div className="space-y-4">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white p-4 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{comment.name}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-green-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        <span>{comment.likes || 0}</span>
                      </button>
                      <button
                        onClick={() => handleDislike(comment.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5 6h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2.5"
                          />
                        </svg>
                        <span>{comment.dislikes || 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p></p>
              )}
            </div>
          </div>
          <div className="mt-16 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Сэтгэгдэл үлдээх</h3>
            <form onSubmit={handleSubmit} className="ml-0">
              <div className="mb-4 w-full">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Нэр
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="mb-4 w-[700px]">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Сэтгэгдэл
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Илгээх
              </button>
            </form>
          </div>
        </div>

        <div className="ml-10 w-1/4">
          <div className="sticky top-22 space-y-8 mt-10">
            <div className="container mt-2">
              <h1 className="text-l font-bold">Сүүлд нэмэгдсэн мэдээлэл</h1>
              <div className="bg-green-500 h-1 w-[220px] mb-6"></div>

              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="flex mb-4 animate-pulse">
                        <div className="w-[120px] h-[96px] bg-gray-200 rounded-lg mr-4"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="mt-4 flex justify-between">
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    ))
                : latestNews.map((item) => (
                    <div key={item.id} className="flex mb-4">
                      <Link href={`/medee/${item.slug}`} legacyBehavior>
                        <a className="flex">
                          <Image
                            src={`data:image/png;base64,${item.coverImage}`}
                            alt="News"
                            width={120}
                            height={96}
                            className="object-cover mr-4 rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="text-[12px] font-bold h-[85px]">
                              {item.title}
                            </h3>
                            <div className="text-xs text-gray-500 mt-4 flex justify-between">
                              <span className="text-blue-500 hover:underline cursor-pointer text-[12px] mt-2">
                                Дэлгэрэнгүй унших
                              </span>
                              <span className="mt-2">
                                {new Date(item.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </a>
                      </Link>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
      <FooterNavBar />
    </div>
  );
};

export default NewsDetail;
