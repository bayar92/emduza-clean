'use client';

import Slider from 'react-slick';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsImagesSliderProps {
  images: string[];
}

const normPath = (p: string) => {
  if (!p) return '';
  const s = p.replace(/^public[/\\]/, '');
  return s.startsWith('/') ? s : `/${s}`;
};

function NextArrow(props: any) {
  return (
    <button
      onClick={props.onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg transition-all"
    >
      <ChevronRight size={20} />
    </button>
  );
}

function PrevArrow(props: any) {
  return (
    <button
      onClick={props.onClick}
      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg transition-all"
    >
      <ChevronLeft size={20} />
    </button>
  );
}

export default function NewsImagesSlider({ images }: NewsImagesSliderProps) {
  if (!images || images.length === 0) return null;

  const normalizedImages = images.map(normPath).filter(Boolean);
  if (normalizedImages.length === 0) return null;

  const settings = {
    dots: true,
    infinite: normalizedImages.length > 1,
    autoplay: normalizedImages.length > 1,
    speed: 500,
    autoplaySpeed: 3500,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="mt-4">
      <Slider {...settings}>
        {normalizedImages.map((img, i) => (
          <div key={i}>
            <div className="relative w-full h-[560px] rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={img}
                alt={`news-image-${i + 1}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
