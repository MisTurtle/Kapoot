import React from 'react';
import { AlarmClockIcon } from 'lucide-react';
import styles from './TimerComponent.module.scss'; // You can extract styles from `editor.module.scss` if needed

type Props = {
  editable?: boolean;
  value: string | number;
  onChange?: (value: string) => void;
};

const QuestionTimer: React.FC<Props> = ({ editable = false, value, onChange }) => {
  return (
    <div className={styles.questionTimer}>
      <AlarmClockIcon size={34} />
      {editable ? (
        <input
          className={styles.timerValue}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        <p className={styles.timerValue}>{value}</p>
      )}
    </div>
  );
};

export default QuestionTimer;