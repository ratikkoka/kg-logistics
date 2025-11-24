import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className='bg-content1 shadow-md'>
      <CardBody className='p-6'>
        <div className='flex flex-col items-start'>
          <div className='mb-4 rounded-full bg-[#FFFAF0] p-3'>
            <Icon className='text-secondary-500 h-6 w-6' icon={icon} />
          </div>
          <h3 className='mb-3 text-xl font-bold'>{title}</h3>
          <p className='text-default-600'>{description}</p>
        </div>
      </CardBody>
    </Card>
  );
}
