import React, { useEffect, useRef, ReactNode } from "react";

interface ScrollableContainerProps {
  children: ReactNode;
}

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [children]); // This effect runs whenever children change

  return (
    <div ref={containerRef} className="selected-options-container">
      {children}
    </div>
  );
};

export default ScrollableContainer;
