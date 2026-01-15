import { useEffect, useRef, useState } from "react";

const ScrollReveal = ({ children, direction = "bottom", delay = 0, duration = 800, distance = "50px", className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(domRef.current);
                }
            });
        }, { threshold: 0.1 });

        const currentRef = domRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    const getTransform = () => {
        if (isVisible) return "translate(0, 0)";
        switch (direction) {
            case "left": return `translate(-${distance}, 0)`;
            case "right": return `translate(${distance}, 0)`;
            case "top": return `translate(0, -${distance})`;
            case "bottom": return `translate(0, ${distance})`;
            default: return `translate(0, ${distance})`;
        }
    };

    return (
        <div
            ref={domRef}
            className={`${className} transition-all ease-out`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: getTransform(),
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`
            }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
