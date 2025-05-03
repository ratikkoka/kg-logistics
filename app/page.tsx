'use client';
import React from 'react';
import { Button, Link } from '@heroui/react';
import TextTransition, { presets } from 'react-text-transition';

import { title } from '@/components/primitives';

const TEXTS = ['For', 'By'];

export default function Home() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const intervalId = setInterval(
      () => setIndex((index) => index + 1),
      3000 // every 3 seconds
    );

    return () => clearTimeout(intervalId);
  }, []);

  return (
    <section className='z-20 flex flex-col items-center justify-center gap-[18px] sm:gap-6'>
      <div className='inline-block max-w-xl justify-center text-center'>
        <span className={title({ size: 'lg' })}>
          <TextTransition
            inline
            className='bg-gradient-to-br from-foreground to-foreground-600 bg-clip-text'
            springConfig={presets.slow}
          >
            {TEXTS[index % TEXTS.length]}
          </TextTransition>
          <span className='bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent'>
            &nbsp;Enthusiasts
          </span>
        </span>
      </div>

      <div className='flex gap-3'>
        <Button
          as={Link}
          className='m-2 h-14 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 px-7 text-2xl text-white shadow-lg'
          href='/ship'
          radius='full'
        >
          Get Started
        </Button>
      </div>
    </section>
  );
}
