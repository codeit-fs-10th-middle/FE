'use client';

import Image from 'next/image';
import Button from '@/components/atoms/Button/ButtonSecondary';
import Label from '@/components/atoms/Label/Label';

export default function Footer() {
  return (
    <div
      style={{
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '100px 0px',
      }}
    >
      {/* Purple top border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
        }}
      />

      {/* Photo Card Image */}
      <div
        style={{
          marginBottom: '20px',
          transform: 'rotate(5deg)',
          transition: 'transform 0.3s ease',
        }}
      >
        <Image
          src="/assets/footer_img.svg"
          alt="Photo Card"
          width={103}
          height={153}
          style={{
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}
        />
      </div>

      {/* Text Message */}
      <Label
        style={{
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: '500',
          marginBottom: '30px',
          textAlign: 'center',
        }}
      >
        나의 최애를 지금 찾아보세요!
      </Label>

      {/* Call-to-Action Button */}
      <Button
        href="/marketplace"
        style={{
          backgroundColor: '#EFFF04',
          color: '#000000',
          padding: '14px 32px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        최애 찾으러 가기
      </Button>
    </div>
  );
}
