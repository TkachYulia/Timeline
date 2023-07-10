import { getTimeFormat } from "../../exports/functions";
import styles from "./main.module.scss";

const CreatedTime = ({ work }) => {
    const computedClassNames = [styles.createdTime];

    return (
        <div className={computedClassNames.join(" ")}>
            <div className={styles.container}>
                {work.workName || ""}<br />
                {getTimeFormat(work.startTime)} - {getTimeFormat(work.finishTime)}
            </div>
        </div>
    );
};

export default CreatedTime;
