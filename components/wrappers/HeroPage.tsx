import { FC, useEffect, useState } from "react";
import styles from './HeroPage.module.scss';


type ShapeProps = {
    id: number;  // To identify unique shapes (number)
    type: string;  // Type of shape for styling, maybe (string)
    size: number;  // Random size for more variations (px)
    left: number;  // X position (vw)
    origin: number;  // Y origin (vh)
    destination: number;  // Y for 0 opacity (vh)
    duration: number;  // Animation duration (s)
};

const HeroPage: FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => {
    
    const [ shapes, setShapes ] = useState<ShapeProps[]>([]);

    useEffect(() => {
        const shapeTypes = ['square', 'rounded', 'circle', 'hex', 'triangle'];
        const animationDuration = 10;  // seconds
        const maxShapesAtOnce = 10;  // units
        const spawnShapeEvery = 1;  // seconds
        const addShape = () => {
            const id = Date.now();
            setShapes((prevShapes) => {
                return [...prevShapes.slice(-maxShapesAtOnce),
                {
                    id: id,
                    type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
                    size: Math.random() * 50 + 20,
                    left: Math.random() * 100,
                    origin: Math.random() * 5,
                    destination: 50 + Math.random() * 10,
                    duration: Math.random() * (animationDuration / 2) + animationDuration / 2
                }]
            });
        };
        
        const interval = setInterval(addShape, 1000 * spawnShapeEvery * animationDuration / maxShapesAtOnce);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`${styles.hero} ${className || ""}`} {...rest}>
          <div className={styles.shapesContainer}>
            {shapes.map((shape) => (
              <div
                key={shape.id}
                className={`${styles.shape} ${styles[shape.type]}`}
                style={{
                    "--destination": shape.destination,
                    backgroundColor: shape.type === "triangle" ? "transparent" : 'black',
                    borderLeft: shape.type === "triangle" ? `${shape.size / 2}px solid transparent` : "none",
                    borderRight: shape.type === "triangle" ? `${shape.size / 2}px solid transparent` : "none",
                    borderBottom: shape.type === "triangle" ? `${shape.size * 0.8660254}px solid black` : "none",
                    width: shape.type === "triangle" ? "0" : `${shape.size}px`,
                    height: shape.type === "triangle" ? "0" : `${shape.size}px`,
                    left: `${shape.left}vw`,
                    bottom: `${shape.origin}vh`,
                    animationDuration: `${shape.duration}s`,
                } as React.CSSProperties}
              >
              </div>
            ))}
          </div>
          {children}
        </div>
      );
    
};

export default HeroPage;

