import { GET_TIME } from "../../exports/functions";
import styles from "./main.module.scss";

const CreatedTime = ({ time, dataItem }) => {
    const computedClassNames = [styles.createdTime];
    let isEmptyCell = true;
    let content = "";

    const dataTimeline = dataItem.timeline;

    if (Array.isArray(dataTimeline)) {
        const matchingTimelineItem = dataTimeline.find((timelineItem) => GET_TIME(timelineItem.startTime) === time);
        
        if (matchingTimelineItem) {
            content = matchingTimelineItem.workName || null;
            isEmptyCell = false;
        }
    }

    if (isEmptyCell) return null;
    return <div className={computedClassNames.join(" ")}>{content}</div>;
};

export default CreatedTime;
