import { useEffect, useState } from "react";
import {
    EQUAL,
    TIME,
    computeAllWorkSize,
    createTimelineTimes,
    getDateTime,
    getDeepValue,
    getTimeFormat,
    getTimeRange,
} from "../exports/functions";
import styles from "./main.module.scss";
import FrozenCell from "./FrozenCell";
import TimelineCell from "./TimelineCell";
import WorkCreateContext from "../context/WorkCreateContext";
import { PORTAL_ID, START_ID, TIME_STEP } from "../exports/constants";
import { useRef } from "react";

const Timeline = ({ initProps }) => {
    const {
        columns: tableColumns,
        creatable: timelineCreatable,
        finishTime: timelineFinishTime,
        startTime: timelineStartTime,
        data: initialData,
    } = initProps;

    const isTimelineCorrect = timelineStartTime < timelineFinishTime;

    const [timelineTimes, setTimelineTimes] = useState(createTimelineTimes(timelineStartTime, timelineFinishTime));
    const [data, setData] = useState(computeAllWorkSize(initialData, timelineTimes));

    const [isCreating, setCreating] = useState(false);
    const [creatingDataId, setCreatingDataId] = useState(null);
    const [creatingStartTime, setCreatingStartTime] = useState(null);
    const [creatingHoverTime, setCreatingHoverTime] = useState(null);
    const [isOverlapping, setOverlapping] = useState(false);
    const [isRightDimension, setRightDimension] = useState(true);
    const [isRightDimensionAvailable, setRightDimensionAvailable] = useState(true);

    const [hoverTime, setHoverTime] = useState(null);
    const [hoverDataId, setHoverDataId] = useState(null);

    const tableRef = useRef(null);

    useEffect(() => {
        setTimelineTimes(createTimelineTimes(timelineStartTime, timelineFinishTime));
    }, [timelineStartTime, timelineFinishTime]);

    const cancelCreating = () => {
        setCreating(false);
        setCreatingDataId(null);
        setCreatingStartTime(null);
        setCreatingHoverTime(null);
        setOverlapping(false);
        setRightDimension(true);
        setRightDimensionAvailable(true);
    };

    const handleClickTimeCell = (id, timelineTime) => {
        if (isCreating) {
            const startTime = Math.min(creatingStartTime, creatingHoverTime);
            const finishTime = Math.max(creatingStartTime, creatingHoverTime);

            if (!isOverlapping) {
                console.log(`New work created!\n${getTimeFormat(startTime)} - ${getTimeFormat(finishTime)}`);
                setData((prevData) =>
                    computeAllWorkSize(
                        prevData.map((dataItem) => {
                            if (dataItem.id === id) {
                                return {
                                    ...dataItem,
                                    timeline: [
                                        ...dataItem.timeline,
                                        {
                                            workName: "Created",
                                            startTime,
                                            finishTime,
                                            color: {
                                                background: "#9ED5C5",
                                                hoverBackground: "#8EC3B0",
                                            }
                                        },
                                    ],
                                };
                            }
                            return dataItem;
                        }),
                        timelineTimes
                    )
                );
            }
            cancelCreating();
            setHoverTime(null);
        } else {
            setCreating(true);
            setCreatingDataId(id);
            setCreatingStartTime(timelineTime.time);
            const computedHoverTime = isRightDimensionAvailable
                ? TIME(timelineTime.time) + TIME_STEP
                : TIME(timelineTime.time) - TIME_STEP;
            setCreatingHoverTime(computedHoverTime);
            setOverlapping(false);
            setRightDimension(isRightDimensionAvailable && (timelineTime.isNotCornerCell || timelineTime.isFirstCell));
            setRightDimensionAvailable(isRightDimensionAvailable);
        }
    };

    const workCreateContext = {
        cancelCreating,
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
    };

    useEffect(() => {
        if (isCreating) {
            const keyDownHandler = (event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    cancelCreating();
                }
            };

            const handleClickOutside = (event) => {
                if (tableRef.current && !tableRef.current.contains(event.target)) {
                    cancelCreating();
                }
            };

            document.addEventListener("keydown", keyDownHandler);
            document.addEventListener("click", handleClickOutside);

            return () => {
                document.removeEventListener("keydown", keyDownHandler);
                document.addEventListener("click", handleClickOutside);
            };
        }
    }, [isCreating]);

    const headingTitleClasses = [styles.th, styles.time];

    const getHeadingTitleClasses = (timelineTime) => {
        const resultClasses = [...headingTitleClasses];
        if (EQUAL(creatingStartTime, timelineTime.time) || EQUAL(creatingHoverTime, timelineTime.time)) {
            resultClasses.push(styles.rangePoints);
            if (isOverlapping) {
                resultClasses.push(styles.error);
            }
        } else if (
            EQUAL(hoverTime, timelineTime.time) ||
            (!isCreating &&
                EQUAL(
                    isRightDimensionAvailable ? TIME(hoverTime) + TIME_STEP : TIME(hoverTime) - TIME_STEP,
                    timelineTime.time
                ))
        ) {
            resultClasses.push(styles.hover);
        }
        if (timelineTime.timeDisplayable) {
            resultClasses.push(styles.timeDisplayable);
        }
        return resultClasses.join(" ");
    };

    return (
        <WorkCreateContext.Provider value={workCreateContext}>
            <div className={styles.container}>
                {isTimelineCorrect ? (
                    <table className={styles.table} ref={tableRef}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr}>
                                {tableColumns.map((column, columnIndex) => (
                                    <FrozenCell
                                        isHeading
                                        key={`head-${column.param}`}
                                        isLastCell={columnIndex === initialData.length}
                                    >
                                        {column.title}
                                    </FrozenCell>
                                ))}
                                <th colSpan={timelineTimes.length || 1} className={styles.th}>
                                    <div className={styles.timelineTitle}>
                                        Шкала работ смены: {getTimeRange(timelineStartTime, timelineFinishTime)}
                                    </div>
                                </th>
                            </tr>
                            <tr className={styles.tr}>
                                {timelineTimes
                                    .filter((timelineTime) => timelineTime.type === START_ID)
                                    .map((timelineTime, timelineTimeIndex) => (
                                        <th
                                            key={timelineTime.id}
                                            className={getHeadingTitleClasses(timelineTime)}
                                            colSpan={2}
                                            style={{ zIndex: timelineTimes.length - timelineTimeIndex }}
                                        >
                                            <div className={styles.helperHeader} />
                                            {timelineTime.timeDisplayable && <div>{getTimeFormat(timelineTime.time)}</div>}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {data.map((dataItem) => (
                                <tr key={dataItem.id} className={styles.tr}>
                                    {tableColumns.map((column, columnIndex) => (
                                        <FrozenCell
                                            key={`body-${column.param}`}
                                            isLastCell={columnIndex === initialData.length}
                                        >
                                            {columnIndex === 0 &&
                                                dataItem.workCount.original !== dataItem.workCount.erased && (
                                                    <>
                                                        <span style={{ color: "red" }}>
                                                            [Скрыто:{" "}
                                                            {dataItem.workCount.original - dataItem.workCount.erased}]
                                                        </span>
                                                        <br />
                                                    </>
                                                )}
                                            {getDeepValue(dataItem, column.param)}
                                        </FrozenCell>
                                    ))}
                                    {timelineTimes.map((timelineTime) => (
                                        <TimelineCell
                                            key={timelineTime.id}
                                            timelineTime={timelineTime}
                                            dataItem={dataItem}
                                        />
                                    ))}
                                </tr>
                            ))}
                            <tr className={styles.helperRow}>
                                {tableColumns.map((column) => (
                                    <td key={`helper-${column.param}`} />
                                ))}
                                {timelineTimes.map((timelineTime) => (
                                    <td key={`helper-${timelineTime.id}`} />
                                ))}
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.errorMessage}>
                        <strong>Некорректный временной диапазон!</strong>
                        <span>
                            от <q>{getDateTime(timelineStartTime)}</q> до <q>{getDateTime(timelineFinishTime)}</q>
                        </span>
                    </div>
                )}
                <div id={PORTAL_ID} style={{ zIndex: 1000 }} />
            </div>
        </WorkCreateContext.Provider>
    );
};

export default Timeline;
