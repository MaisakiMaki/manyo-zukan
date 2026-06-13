'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function BottomSheet({ isOpen, onClose, children }: Props) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  function handlePointerDown(e: React.PointerEvent) {
    startYRef.current = e.clientY;
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current) return;
    const delta = e.clientY - startYRef.current;
    if (delta < 10) return; // 10px未満は無視
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const delta = e.clientY - startYRef.current;

    if (delta > 120) {
      // 120px以上下にスワイプしたら閉じる
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'transform 250ms ease-out';
        sheetRef.current.style.transform = 'translateY(100%)';
      }
      setTimeout(() => {
        if (sheetRef.current) {
          sheetRef.current.style.transform = '';
          sheetRef.current.style.transition = '';
        }
        onClose();
      }, 250);
    } else {
      // 元に戻す
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'transform 250ms ease-out';
        sheetRef.current.style.transform = 'translateY(0)';
      }
      setTimeout(() => {
        if (sheetRef.current) {
          sheetRef.current.style.transition = '';
        }
      }, 250);
    }
  }

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    } else {
      setAnimate(false);
      const timer = setTimeout(() => {
        setVisible(false);
        // transformをリセット
        if (sheetRef.current) {
          sheetRef.current.style.transform = '';
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        style={{ opacity: animate ? 1 : 0 }}
        onClick={onClose}
      />

      <div
        ref={sheetRef}
        className="relative w-full max-w-sm bg-white rounded-t-2xl overflow-y-auto transition-transform duration-300 ease-out"
        style={{
          maxHeight: '92svh',
          transform: animate ? 'translateY(0)' : 'translateY(100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ハンドルバー */}
        <div
          className="flex justify-center pt-3 pb-4 cursor-grab touch-none select-none"
          style={{ paddingBottom: '16px', marginBottom: '-8px' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="w-10 h-1 rounded-full bg-[#ddeec0]" />
        </div>

        {/* 上部タッチエリア（透明、スワイプ用） */}
        <div
          className="absolute top-0 left-0 right-0 touch-none"
          style={{ height: '30px', zIndex: 10 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {children}
      </div>
    </div>
  );
}