import React from "react";
import styles from "./FloatingEmotes.module.scss";

type Props = {
  floatingEmotes: EmoteData[];
  getEmoteIcon: (type: number) => React.ReactNode;
};

const FloatingEmotes: React.FC<Props> = ({ floatingEmotes, getEmoteIcon }) => {
  return (
    <div className={styles.emoteContainer}>
  {floatingEmotes.map(({ id, type, left, bottom, drift, rotation }) => (
    <div
      key={id}
      className={styles.floatingEmote}
      style={{
        left: `${left}%`,
        bottom: `${bottom}px`,
        '--drift': `${drift}px`,
        '--rotation': `${rotation}deg`,
      } as React.CSSProperties}
    >
      {getEmoteIcon(type)}
    </div>
  ))}
</div>


  );
};

export default FloatingEmotes;
