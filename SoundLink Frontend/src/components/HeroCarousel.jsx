import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import LazyImage from './LazyImage';

const images = [
  // Replace these with your Cloudinary URLs or dynamic data
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=900&q=80',
];

const HeroCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    pauseOnHover: true,
    centerMode: true,
    centerPadding: '120px',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          centerPadding: '60px',
        },
      },
      {
        breakpoint: 900,
        settings: {
          centerPadding: '30px',
        },
      },
      {
        breakpoint: 600,
        settings: {
          centerPadding: '0px',
        },
      },
    ],
    // Optimize performance by only rendering a few slides at a time
    lazyLoad: 'ondemand',
  };

  return (
    <div className="flex justify-center w-full mb-100">
      <div
        className="rounded-2xl overflow-visible"
        style={{ maxWidth: 1000, width: '100%' }}
      >
        <Slider {...settings}>
          {images.map((img, idx) => (
            <div key={idx} className="relative h-64 md:h-80 bg-black px-2 slick-slide-custom">
              <LazyImage
                src={img}
                alt={`Hero ${idx + 1}`}
                className="w-full h-full object-cover object-center rounded-2xl shadow-xl border-2 border-black"
                eager={idx === 0} // Load the first image eagerly
                width="100%"
                height="100%"
              />
              {/* Optional overlay text/button here */}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default HeroCarousel; 