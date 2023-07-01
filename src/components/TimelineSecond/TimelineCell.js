import { useContext } from "react";
import { GET_TIME, roundTimeByStep } from "../../exports/functions";
import CreatedTime from "./CreatedTime";
import styles from "./main.module.scss";
import { message } from "antd";
import WorkCreateContext from "../../context/WorkCreateContext";

const TimelineCell = ({ time, dataItem, timelineIndex }) => {
    const workCreateContext = useContext(WorkCreateContext);

    const computedClassNames = [
        styles.td,
        styles.timeCell,
        ...(GET_TIME(roundTimeByStep()) === time ? [styles.currentTime] : []),
    ];
    const foundedWork = dataItem.timeline.find((work) => GET_TIME(work.startTime) === time);

    if (
        workCreateContext.isCreating &&
        workCreateContext.creatingDataId === dataItem.id &&
        (time === workCreateContext.creatingStartTime ||
            (!!workCreateContext.creatingStartTime &&
                workCreateContext.creatingStartTime <= time &&
                !!workCreateContext.creatingHoverTime &&
                time <= workCreateContext.creatingHoverTime) ||
            (!!workCreateContext.creatingHoverTime &&
                workCreateContext.creatingHoverTime <= time &&
                !!workCreateContext.creatingStartTime &&
                time <= workCreateContext.creatingStartTime))
    ) {
        computedClassNames.push(styles.creating);
    }
    if (workCreateContext.isOverlapping) {
        computedClassNames.push(styles.overlapping);
    }

    const enabledToCreateWork =
        !dataItem.timeline.some((work) => GET_TIME(work.startTime) <= time && time <= GET_TIME(work.finishTime)) &&
        !dataItem.timeline.some(
            (work) =>
                (time <= GET_TIME(work.startTime) && GET_TIME(work.finishTime) <= workCreateContext.creatingStartTime) ||
                (workCreateContext.creatingStartTime <= GET_TIME(work.startTime) && GET_TIME(work.finishTime) <= time)
        );

    const handleClick = () => {
        if (workCreateContext.isCreating && !enabledToCreateWork) {
            message.error("Невозможно создать действие: пересечение временных интервалов");
        } else {
            workCreateContext.handleClickTimeCell(dataItem.id, time);
        }
    };
    const handleMouseEnter = () => {
        if (workCreateContext.creatingDataId === dataItem.id) {
            if (enabledToCreateWork) {
                workCreateContext.setCreatingHoverTime(time);
                workCreateContext.setOverlapping(false);
            } else {
                workCreateContext.setOverlapping(true);
            }
        }
    };

    if (dataItem.workCellIndexes.find((workCellIndex) => workCellIndex.index === timelineIndex)?.isStart === false)
        return null;
    return (
        <td
            className={computedClassNames.join(" ")}
            colSpan={foundedWork?.colSpan || 1}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
        >
            <CreatedTime time={time} dataItem={dataItem} />
        </td>
    );
};

export default TimelineCell;
