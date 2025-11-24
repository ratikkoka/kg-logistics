'use client';

import React from 'react';
import { Card, CardBody } from '@heroui/react';

import { FeatureCard } from '@/components/feature-card/feature-card';

export default function AboutPage() {
  return (
    <div>
      <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mb-16 text-center'>
          <h2 className='from-foreground to-foreground-600 mb-4 bg-linear-to-br bg-clip-text px-2 text-center text-3xl font-bold tracking-tight text-transparent'>
            About Us
          </h2>
          <Card className='bg-content1 mx-auto max-w-3xl shadow-md'>
            <CardBody className='px-6 py-8 text-left'>
              <p className='text-foreground leading-relaxed'>
                We are a team of long time car enthusiasts who pride ourselves
                on quality above all else. From years of having our own cars
                shipped, we know exactly what inspires confidence and what
                premium service is.
              </p>
              <p className='text-foreground mt-4 leading-relaxed'>
                That is why our motto is:{' '}
                <span className='font-semibold italic'>
                  Treat customer cars the way we&apos;d want our own to be
                  treated.{' '}
                </span>
                From daily commuters to rare exotics, we will deliver top
                quality customer service and a worry free delivery experience.
              </p>
              <p className='text-foreground mt-4 leading-relaxed font-medium'>
                When you choose KG Logistics, you choose peace of mind.
              </p>
            </CardBody>
          </Card>
        </div>

        <div className='mb-16'>
          <h2 className='from-foreground to-foreground-600 mb-8 bg-linear-to-br bg-clip-text px-2 text-center text-3xl font-bold tracking-tight text-transparent'>
            Why Choose Us
          </h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            <FeatureCard
              description='Our team has moved over a million dollars worth of automobiles over just the past year alone. From open transporting off roading rigs to enclosed transport for supercars, we have the experience to do right by the customer!'
              icon='lucide:truck'
              title='Experience'
            />
            <FeatureCard
              description='With us, you will receive courtesy service from pickup to drop off at any location of your convenience. Simply lay back and enjoy with maximum peace of mind.'
              icon='lucide:thumbs-up'
              title='Convenience'
            />
            <FeatureCard
              description='All of our carriers meet national insurance standards or higher, we only work with carriers that are insured up to a bare minimum of 1 million dollars. In the incredibly unlikely event of any incidents occurring, you can rest assured that you will be compensated to the maximum.'
              icon='lucide:shield-check'
              title='Fully Insured'
            />
            <FeatureCard
              description='We offer the lowest price without compromising on quality, whether you are shipping an exotic or an NA Miata, we will beat your lowest quote and deliver better customer service!'
              icon='lucide:dollar-sign'
              title='Budget Friendly'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
