import { useContext, useMemo } from "react";
import CreatedTime from "./CreatedTime";
import styles from "./main.module.scss";
import WorkCreateContext from "../context/WorkCreateContext";
import { FINISH_ID, START_ID } from "../exports/constants";
import PropsContext from "../context/PropsContext";

const TimelineCell = ({ timelineTime, dataItem }) => {
    const { timelineStartTime, timelineFinishTime, byBreakPoint, CONST, FUNC } = useContext(PropsContext);
    const workCreateContext = useContext(WorkCreateContext);

    const computedClassNames = [styles.td, styles.timeCell];

    const work = useMemo(
        () =>
            dataItem.timeline.find(
                (work) => FUNC.EQUAL(work.startTime, timelineTime.time) && timelineTime.type === START_ID
            ),
        [dataItem.timeline]
    );

    const matchingTimelineWork = useMemo(
        () =>
            dataItem.timeline.find(
                (timelineItem) =>
                    FUNC.EQUAL(timelineItem.startTime, timelineTime.time) &&
                    dataItem.workCellIndexes.some(
                        (workCellIndex) => workCellIndex.id === timelineTime.id && timelineTime.type === START_ID
                    )
            ),
        [dataItem.timeline]
    );

    const hasWork = !!matchingTimelineWork;

    const {
        creatingDataId,
        creatingHoverTime,
        creatingStartTime,
        handleClickTimeCell,
        hoverTime,
        hoverDataId,
        isCreating,
        isOverlapping,
        isRightDimension,
        setCreatingHoverTime,
        setHoverTime,
        setHoverDataId,
        setOverlapping,
        setRightDimension,
        setRightDimensionAvailable,
        timelineCreatable,
    } = workCreateContext;

    const isCurrentDataRow = creatingDataId === dataItem.id;

    const rangeStart = isRightDimension ? creatingStartTime : creatingHoverTime;
    const rangeFinish = isRightDimension ? creatingHoverTime : creatingStartTime;

    const isStartTime = FUNC.EQUAL(timelineTime.time, creatingStartTime);
    const isHoverTime = FUNC.EQUAL(timelineTime.time, creatingHoverTime);
    const isMiddleTime = FUNC.BETWEEN(rangeStart, timelineTime.time, rangeFinish);

    const foundWorkCell = useMemo(
        () => dataItem.workCellIndexes.find((workCellIndex) => workCellIndex.id === timelineTime.id),
        [dataItem.workCellIndexes]
    );

    const enabledToCreateWork =
        timelineCreatable &&
        (foundWorkCell === undefined || foundWorkCell?.enabled) &&
        (!timelineTime.isNotCornerCell ||
            (timelineTime.type === FINISH_ID
                ? FUNC.TIME(timelineTime.time) - CONST.TIME_STEP_CREATE >= FUNC.TIME(timelineStartTime)
                : FUNC.TIME(timelineTime.time) + CONST.TIME_STEP_CREATE <= FUNC.TIME(timelineFinishTime))) &&
        (!isCreating ||
            (creatingDataId === dataItem.id &&
                (FUNC.TIME(creatingStartTime) - timelineTime.time) % CONST.TIME_STEP_CREATE === 0)) &&
        (!byBreakPoint || timelineTime.breakPoint);

    const creatingCondition =
        isCurrentDataRow &&
        ((isStartTime &&
            ((isRightDimension && timelineTime.type === START_ID) ||
                (!isRightDimension && timelineTime.type === FINISH_ID))) ||
            (!FUNC.EQUAL(creatingStartTime, creatingHoverTime) &&
                isHoverTime &&
                ((isRightDimension && timelineTime.type === FINISH_ID) ||
                    (!isRightDimension && timelineTime.type === START_ID))) ||
            isMiddleTime);
    if (creatingCondition) {
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
            hoverDataId === dataItem.id &&
            FUNC.EQUAL(hoverTime, timelineTime.time) &&
            ((timelineTime.isFirstTime && timelineTime.type === START_ID) ||
                (timelineTime.isLastTime && timelineTime.type === FINISH_ID))
        ) {
            computedClassNames.push(styles.active);
        }
    }

    if (!timelineTime.isNotCornerCell) {
        computedClassNames.push(styles.isNotCornerCell);
    }

    const tempIsRightDimensionAvailable = useMemo(
        () =>
            !dataItem?.timeline?.some((dataTimelineItem) => FUNC.EQUAL(dataTimelineItem.startTime, timelineTime.time)) &&
            !timelineTime.isLastTime &&
            ((!timelineTime.isNotCornerCell && timelineTime.type === FINISH_ID) || timelineTime.type === START_ID),
        [dataItem.timeline]
    );

    const handleClick = () => {
        if (isCreating && !isCurrentDataRow) return;

        if (isOverlapping) {
            console.error("Невозможно создать действие: пересечение временных интервалов");
            // cancelCreating();
        } else if ((!isCreating || isCurrentDataRow) && !hasWork && (creatingCondition || enabledToCreateWork)) {
            handleClickTimeCell(dataItem.id, isCreating ? creatingHoverTime : timelineTime, tempIsRightDimensionAvailable);
        }
    };

    const handleMouseEnter = () => {
        setHoverTime(() => (enabledToCreateWork ? timelineTime.time : null));
        setHoverDataId(dataItem.id);
        setRightDimensionAvailable(
            !dataItem?.timeline?.some((dataTimelineItem) => FUNC.EQUAL(dataTimelineItem.startTime, timelineTime.time)) &&
                !timelineTime.isLastTime &&
                ((!timelineTime.isNotCornerCell && timelineTime.type === FINISH_ID) || timelineTime.type === START_ID)
        );
        if (!isCurrentDataRow || !timelineTime.isNotCornerCell) return;

        const hoveredTime = timelineTime.time;

        const rangeStartTime = Math.min(creatingStartTime, hoveredTime);
        const rangeFinishTime = Math.max(creatingStartTime, hoveredTime);

        const isHoverRangeAvailable = !dataItem.timeline.some(
            (dataTimelineItem) =>
                FUNC.BETWEEN(rangeStartTime, dataTimelineItem.startTime, rangeFinishTime) ||
                FUNC.BETWEEN(rangeStartTime, dataTimelineItem.finishTime, rangeFinishTime) ||
                (timelineTime.type === START_ID &&
                    FUNC.BETWEEN(rangeStartTime, dataTimelineItem.startTime, rangeFinishTime, true)) ||
                (timelineTime.type === FINISH_ID &&
                    FUNC.BETWEEN(rangeStartTime, dataTimelineItem.finishTime, rangeFinishTime, false, true))
        );

        if (isHoverRangeAvailable && enabledToCreateWork) {
            const isRightDimensionAvailable = FUNC.EQUAL(creatingStartTime, hoveredTime)
                ? timelineTime.type === START_ID
                : FUNC.TIME(creatingStartTime) < FUNC.TIME(hoveredTime);
            setRightDimension(isRightDimensionAvailable);
            setCreatingHoverTime(
                FUNC.EQUAL(hoveredTime, creatingStartTime)
                    ? isRightDimensionAvailable
                        ? FUNC.TIME(hoveredTime) + CONST.TIME_STEP_CREATE
                        : FUNC.TIME(hoveredTime) - CONST.TIME_STEP_CREATE
                    : hoveredTime
            );
            setOverlapping(false);
        } else {
            setOverlapping(!isHoverRangeAvailable);
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
    if (!enabledToCreateWork && !creatingCondition) {
        computedClassNames.push(styles.notClickable);
    }

    const showEnableZones = true;
    return (
        <td
            className={computedClassNames.join(" ")}
            colSpan={work?.colSpan || 1}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={showEnableZones ? { backgroundColor: enabledToCreateWork ? "#81CE85" : "#CE8181" } : {}}
        >
            <div className={styles.helperContent} />
            {hasWork && <CreatedTime work={matchingTimelineWork} />}
        </td>
    );
};

export default TimelineCell;
