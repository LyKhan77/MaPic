import { useEffect, useState } from 'react';
import './BearAnimation.css';

interface BearAnimationProps {
  isTyping?: boolean;
}

const BearAnimation = ({ isTyping }: BearAnimationProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30; // Increased range for whole head
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={`loader-container ${isTyping ? 'is-typing' : ''}`}>
      <div 
        className="mouse-follower" 
        style={{ 
          // @ts-ignore
          '--mouse-x': `${mousePos.x}px`,
          '--mouse-y': `${mousePos.y}px`
        }} 
      >
        <div className="loader" />
      </div>
    </div>
  );
}

export default BearAnimation;
