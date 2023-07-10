import { useContext } from "react";
import { TIME, BETWEEN, EQUAL } from "../../exports/functions";
import CreatedTime from "./CreatedTime";
import styles from "./main.module.scss";
import { message } from "antd";
import WorkCreateContext from "../../context/WorkCreateContext";
import { FINISH_ID, START_ID, TIME_STEP } from "../../exports/constants";

const TimelineCell = ({ timelineTime, dataItem }) => {
    const workCreateContext = useContext(WorkCreateContext);

    const computedClassNames = [styles.td, styles.timeCell];

    const work = dataItem.timeline.find(
        (work) => EQUAL(work.startTime, timelineTime.time) && timelineTime.type === START_ID
    );

    const matchingTimelineWork = dataItem.timeline.find(
        (timelineItem) =>
            EQUAL(timelineItem.startTime, timelineTime.time) &&
            dataItem.workCellIndexes.some(
                (workCellIndex) => workCellIndex.id === timelineTime.id && timelineTime.type === START_ID
            )
    );
    const hasWork = !!matchingTimelineWork;

    const {
        cancelCreating,
        creatingDataId,
        creatingHoverTime,
        creatingStartTime,
        handleClickTimeCell,
        hoverTime,
        isCreating,
        isOverlapping,
        isRightDimension,
        setCreatingHoverTime,
        setHoverTime,
        setOverlapping,
        setRightDimension,
        setRightDimensionAvailable,
    } = workCreateContext;

    const isCurrentDataRow = creatingDataId === dataItem.id;

    const rangeStart = isRightDimension ? creatingStartTime : creatingHoverTime;
    const rangeFinish = isRightDimension ? creatingHoverTime : creatingStartTime;

    const isStartTime = EQUAL(timelineTime.time, creatingStartTime);
    const isHoverTime = EQUAL(timelineTime.time, creatingHoverTime);
    const isMiddleTime = BETWEEN(rangeStart, timelineTime.time, rangeFinish);

    const foundWorkCell = dataItem.workCellIndexes.find((workCellIndex) => workCellIndex.id === timelineTime.id);
    const enabledToCreateWork = foundWorkCell === undefined || foundWorkCell?.enabled;

    if (
        isCurrentDataRow &&
        ((isStartTime &&
            ((isRightDimension && timelineTime.type === START_ID) ||
                (!isRightDimension && timelineTime.type === FINISH_ID))) ||
            (!EQUAL(creatingStartTime, creatingHoverTime) &&
                isHoverTime &&
                ((isRightDimension && timelineTime.type === FINISH_ID) ||
                    (!isRightDimension && timelineTime.type === START_ID))) ||
            isMiddleTime)
    ) {
        computedClassNames.push(styles.creating);
    }

    if (isOverlapping) {
        computedClassNames.push(styles.overlapping);
    }

    if (timelineTime.order % 2 === 1 && !hasWork) {
        computedClassNames.push(styles.borderless);
    }

    if (!isCreating) {
        if (enabledToCreateWork) {
            computedClassNames.push(styles.enabled);
        }
        if (timelineTime.type === FINISH_ID) {
            computedClassNames.push(styles.finish);
        } else {
            computedClassNames.push(styles.start);
        }
        if (
            EQUAL(hoverTime, timelineTime.time) &&
            ((timelineTime.isFirstTime && timelineTime.type === START_ID) ||
                (timelineTime.isLastTime && timelineTime.type === FINISH_ID))
        ) {
            computedClassNames.push(styles.active);
        }
    }

    if (!timelineTime.isNotCornerCell) {
        computedClassNames.push(styles.isNotCornerCell);
    }

    const handleClick = () => {
        if (isCreating && !isCurrentDataRow) return;

        if (isOverlapping) {
            message.error("Невозможно создать действие: пересечение временных интервалов");
            // cancelCreating();
        } else if ((!isCreating || isCurrentDataRow) && !hasWork && enabledToCreateWork) {
            setRightDimension(timelineTime.type === START_ID);
            handleClickTimeCell(dataItem.id, isCreating ? creatingHoverTime : timelineTime);
        }
    };

    const handleMouseEnter = () => {
        setHoverTime(() => (enabledToCreateWork ? timelineTime.time : null));
        setRightDimensionAvailable(
            !dataItem?.timeline?.some((dataTimelineItem) => EQUAL(dataTimelineItem.startTime, timelineTime.time)) &&
                !timelineTime.isLastTime &&
                ((!timelineTime.isNotCornerCell && timelineTime.type === FINISH_ID) || timelineTime.type === START_ID)
        );
        if (!isCurrentDataRow || !timelineTime.isNotCornerCell) return;

        const hoveredTime = timelineTime.time;

        const rangeStartTime = Math.min(creatingStartTime, hoveredTime);
        const rangeFinishTime = Math.max(creatingStartTime, hoveredTime);

        const isHoverRangeAvailable = !dataItem.timeline.some(
            (dataTimelineItem) =>
                BETWEEN(rangeStartTime, dataTimelineItem.startTime, rangeFinishTime) ||
                BETWEEN(rangeStartTime, dataTimelineItem.finishTime, rangeFinishTime) ||
                (timelineTime.type === START_ID &&
                    BETWEEN(rangeStartTime, dataTimelineItem.startTime, rangeFinishTime, true)) ||
                (timelineTime.type === FINISH_ID &&
                    BETWEEN(rangeStartTime, dataTimelineItem.finishTime, rangeFinishTime, false, true))
        );

        if (isHoverRangeAvailable && enabledToCreateWork) {
            const isRightDimensionAvailable = EQUAL(creatingStartTime, hoveredTime)
                ? timelineTime.type === START_ID
                : TIME(creatingStartTime) < TIME(hoveredTime);
            setRightDimension(isRightDimensionAvailable);
            setCreatingHoverTime(
                EQUAL(hoveredTime, creatingStartTime)
                    ? isRightDimensionAvailable
                        ? TIME(hoveredTime) + TIME_STEP
                        : TIME(hoveredTime) - TIME_STEP
                    : hoveredTime
            );
            setOverlapping(false);
        } else {
            setOverlapping(true);
        }
    };

    const handleMouseLeave = () => {
        setHoverTime(() => null);
    };

    if (dataItem.workCellIndexes.find((workCellIndex) => workCellIndex.id === timelineTime.id)?.displayable === false)
        return null;

    const removeCellBorder =
        isCurrentDataRow &&
        (isRightDimension
            ? (timelineTime.type === START_ID && isStartTime) || isMiddleTime
            : (timelineTime.type === START_ID && isHoverTime) || isMiddleTime);
    if (removeCellBorder) {
        computedClassNames.push(styles.hideBorder);
    }
    if (!enabledToCreateWork) {
        computedClassNames.push(styles.withWork);
    }
    return (
        <td
            className={computedClassNames.join(" ")}
            colSpan={work?.colSpan || 1}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {hasWork && <CreatedTime work={matchingTimelineWork} />}
        </td>
    );
};

export default TimelineCell;
