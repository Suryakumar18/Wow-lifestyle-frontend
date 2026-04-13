'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the interface for props
interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [status, setStatus] = useState<'idle' | 'driving'>('idle');

  useEffect(() => {
    // Automatically trigger the car animation after 1.5 seconds
    // This gives the joystick 1 second to animate in, pauses for 0.5s, then drives the car
    const timer = setTimeout(() => {
      setStatus('driving');
    }, 1500);

    // Cleanup the timer if the component unmounts early
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
      // Animation: Wait for car to pass, then fade out black background
      animate={{ opacity: status === 'driving' ? [1, 1, 0] : 1 }} 
      transition={{ duration: 1.5, times: [0, 0.7, 1], ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (status === 'driving') {
           onComplete(); // Unmount preloader -> Reveal Site
        }
      }}
    >
      
      {/* --- AUTOMATIC CONTENT (Logo / Joystick) --- */}
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div 
            className="relative z-20 w-full flex justify-center px-4" 
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)", transition: { duration: 0.3 } }}
          >
            {/* 1. THE IMAGE (Xbox Logo) */}
            {/* CHANGED: Added w-[50vw] to ensure it scales down smoothly on very small mobile screens */}
            <motion.img
              src="/xbox.png"
              alt="Logo"
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(15px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1, ease: "easeOut" }}
              // Breathing animation while waiting
              whileInView={{ scale: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity } }}
              className="w-[50vw] max-w-[200px] sm:max-w-none sm:w-[280px] md:w-[350px] object-contain transition-all duration-500"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- THE CAR ANIMATION --- */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-50 pointer-events-none"
        // CHANGED: Pushed to -250vw. Because the car is so wide, -150vw wasn't far enough left to hide its right edge!
        initial={{ x: "-250vw", y: "-50%" }} 
        // Animate to x: -50% to perfectly align the center of the car with the center of the screen
        animate={status === 'driving' ? { x: "-50%", y: "-50%" } : { x: "-250vw", y: "-50%" }} 
        transition={{ 
          duration: 0.8, // Sped up the car to make it come in fast
          ease: [0.22, 1, 0.36, 1], // "Fast in, slow out" motion - makes it brake nicely in the center
          delay: 0.1 // Slight delay after joystick disappears
        }}
      >
        {/* CHANGED: Adjusted mobile width slightly to 140vw to prevent massive overflow rendering issues on iOS Safari */}
        <img 
          src="/pngcar.png" 
          alt="Race Car" 
          className="w-[140vw] sm:w-[100vw] md:w-[900px] max-w-none h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        />
        
        {/* Speed lines/Motion Blur trail */}
        <div className="absolute top-1/2 right-0 w-[50%] h-[200px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent blur-3xl transform -translate-y-1/2 -skew-x-12" />
      </motion.div>

    </motion.div>
  );
}