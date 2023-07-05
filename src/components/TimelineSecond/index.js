import Tippy, { useSingleton } from "@tippyjs/react";
import { useEffect, useState } from "react";
import { message } from "antd";
import {
    EQUAL,
    TIME,
    computeAllWorkSize,
    createTimelineTimes,
    createWork,
    getDateTime,
    getTimeFormat,
} from "../../exports/functions";
import styles from "./main.module.scss";
import FrozenCell from "./FrozenCell";
import TimelineCell from "./TimelineCell";
import WorkCreateContext from "../../context/WorkCreateContext";
import { START_ID, TIME_STEP } from "../../exports/constants";
import { useRef } from "react";

const exampleDate = [
    {
        id: 1,
        transport: "КАМАЗ 53215 № 2215",
        inventaryNumber: "7036320",
        transportCode: "100500",
        timeline: [createWork("Some easy work", "8:00", "8:30"), createWork("Other harder work", "11:00", "12:00")],
    },
    {
        id: 2,
        transport: "КАМАЗ 53215 № 4487",
        inventaryNumber: "6854998",
        transportCode: "155044",
        timeline: [
            createWork("Something little", "7:00", "7:15"),
            createWork("Repair works 1", "8:15", "9:15"),
            createWork("Repair works 2", "9:30", "11:15"),
        ],
    },
];

const cellDeployer = [
    {
        title: "Транспорт",
        param: "transport",
    },
    {
        title: "Инвентарный номер",
        param: "inventaryNumber",
    },
    {
        title: "Код транспорта",
        param: "transportCode",
    },
];

const TimelineSecond = ({ startTime: timelineStartTime, finishTime: timelineFinishTime }) => {
    const [messageApi, contextHolder] = message.useMessage();

    const isTimelineCorrect = timelineStartTime < timelineFinishTime;

    const [timelineTimes, setTimelineTimes] = useState(createTimelineTimes(timelineStartTime, timelineFinishTime));
    const [data, setData] = useState(computeAllWorkSize(exampleDate, timelineTimes));

    const [isCreating, setCreating] = useState(false);
    const [creatingDataId, setCreatingDataId] = useState(null);
    const [creatingStartTime, setCreatingStartTime] = useState(null);
    const [creatingHoverTime, setCreatingHoverTime] = useState(null);
    const [isOverlapping, setOverlapping] = useState(false);
    const [isRightDimension, setRightDimension] = useState(true);
    const [isRightDimensionAvailable, setRightDimensionAvailable] = useState(true);

    const [hoverTime, setHoverTime] = useState(null);

    const tableRef = useRef(null);

    useEffect(() => {
        setTimelineTimes(createTimelineTimes(timelineStartTime, timelineFinishTime));
    }, [timelineStartTime, timelineFinishTime]);

    // Tooltip
    const [source, target] = useSingleton({
        overrides: ["delay", "arrow"],
    });

    const cancelCreating = () => {
        setCreating(false);
        setCreatingDataId(null);
        setCreatingStartTime(null);
        setCreatingHoverTime(null);
        setOverlapping(false);
        setRightDimension(true);
    };

    const handleClickTimeCell = (id, timelineTime) => {
        if (isCreating) {
            const startTime = Math.min(creatingStartTime, creatingHoverTime);
            const finishTime = Math.max(creatingStartTime, creatingHoverTime);

            if (!isOverlapping) {
                message.success(
                    <div style={{ width: "200px", textAlign: "left" }}>
                        <h3>New work created!</h3>
                        <div
                            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                            <span>FROM:</span>
                            <span>{getDateTime(startTime)}</span>
                        </div>
                        <div
                            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                            <span>TILL:</span>
                            <span>{getDateTime(finishTime)}</span>
                        </div>
                    </div>
                );
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
        isCreating,
        isOverlapping,
        isRightDimension,
        setCreatingHoverTime,
        setHoverTime,
        setOverlapping,
        setRightDimension,
        setRightDimensionAvailable,
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
        return resultClasses.join(" ");
    };

    return (
        <WorkCreateContext.Provider value={workCreateContext}>
            <div className={styles.container}>
                <Tippy singleton={source} delay={500} />
                {isTimelineCorrect ? (
                    <table className={styles.table} ref={tableRef}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr}>
                                {cellDeployer.map((cellItem, cellIndex) => (
                                    <FrozenCell
                                        isHeading
                                        key={`head-${cellItem.param}`}
                                        isLastCell={cellIndex === exampleDate.length}
                                    >
                                        {cellItem.title}
                                    </FrozenCell>
                                ))}
                                <th colSpan={timelineTimes.length || 1} className={styles.th}>
                                    <div className={styles.timelineTitle}>Шкала работ смены</div>
                                </th>
                            </tr>
                            <tr className={styles.tr}>
                                {timelineTimes
                                    .filter((timelineTime) => timelineTime.type === START_ID)
                                    .map((timelineTime) => (
                                        <th
                                            key={timelineTime.id}
                                            className={getHeadingTitleClasses(timelineTime)}
                                            colSpan={2}
                                        >
                                            <div>{getTimeFormat(timelineTime.time)}</div>
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {data.map((dataItem) => (
                                <tr key={dataItem.id} className={styles.tr}>
                                    {cellDeployer.map((cellItem, cellIndex) => (
                                        <FrozenCell
                                            key={`body-${cellItem.param}`}
                                            isLastCell={cellIndex === exampleDate.length}
                                        >
                                            {dataItem[cellItem.param]}
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
                                {cellDeployer.map((cellItem) => (
                                    <td key={`helper-${cellItem.param}`} />
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
            </div>
        </WorkCreateContext.Provider>
    );
};

export default TimelineSecond;
