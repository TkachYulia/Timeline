import Tippy, { useSingleton } from "@tippyjs/react";
import { useEffect, useState } from "react";
import { message } from "antd";
import {
    GET_TIME,
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

const exampleDate = [
    {
        id: 1,
        transport: "КАМАЗ 53215 № 2215",
        inventaryNumber: "7036320",
        transportCode: "100500",
        timeline: [createWork("Some easy work", 0, 30), createWork("Other harder work", 90, 180)],
    },
    {
        id: 2,
        transport: "КАМАЗ 53215 № 4487",
        inventaryNumber: "6854998",
        transportCode: "155044",
        timeline: [createWork("Something little", -60, -60), createWork("Repair works", 30, 75), createWork("Repair works", 75, 105)],
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
    const [timelineTimes, setTimelineTimes] = useState(createTimelineTimes(timelineStartTime, timelineFinishTime));
    const [data, setData] = useState(computeAllWorkSize(exampleDate, timelineTimes));

    console.log(data);

    const [isCreating, setCreating] = useState(false);
    const [creatingDataId, setCreatingDataId] = useState(null);
    const [creatingStartTime, setCreatingStartTime] = useState(null);
    const [creatingHoverTime, setCreatingHoverTime] = useState(null);
    const [isOverlapping, setOverlapping] = useState(false);

    useEffect(() => {
        setTimelineTimes(createTimelineTimes(timelineStartTime, timelineFinishTime));
    }, [timelineStartTime, timelineFinishTime]);

    // Tooltip
    const [source, target] = useSingleton({
        overrides: ["delay", "arrow"],
    });

    const handleClickTimeCell = (id, time) => {
        if (isCreating) {
            const startTime = Math.min(creatingStartTime, time);
            const finishTime = Math.max(creatingStartTime, time);
            if (!isOverlapping) {
                message.success(
                    <div style={{ width: "150px", textAlign: "left" }}>
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
            setCreating(false);
            setCreatingDataId(null);
            setCreatingStartTime(null);
            setCreatingHoverTime(null);
            setOverlapping(false);
        } else {
            setCreating(true);
            setCreatingDataId(id);
            setCreatingStartTime(time);
            setCreatingHoverTime(null);
            setOverlapping(false);
        }
    };

    const workCreateContext = {
        handleClickTimeCell,
        isCreating,
        creatingDataId,
        creatingStartTime,
        creatingHoverTime,
        setCreatingHoverTime,
        isOverlapping,
        setOverlapping,
    };

    return (
        <WorkCreateContext.Provider value={workCreateContext}>
            <div className={styles.container}>
                <div style={{ position: "sticky", left: 0 }}>
                    {getDateTime(timelineStartTime)} - {getDateTime(timelineFinishTime)}
                </div>
                <Tippy singleton={source} delay={500} />
                <table className={styles.table}>
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
                            {timelineTimes.map((timelineTime) => (
                                <th key={timelineTime.getTime()} className={`${styles.th} ${styles.time}`}>
                                    <div>{getTimeFormat(timelineTime)}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {data.map((dataItem) => (
                            <tr key={dataItem.id} className={styles.tr}>
                                {cellDeployer.map((cellItem, cellIndex) => (
                                    <FrozenCell key={`body-${cellItem.param}`} isLastCell={cellIndex === exampleDate.length}>
                                        {dataItem[cellItem.param]}
                                    </FrozenCell>
                                ))}
                                {timelineTimes.map((timelineTime, timelineIndex) => (
                                    <TimelineCell
                                        key={GET_TIME(timelineTime)}
                                        time={GET_TIME(timelineTime)}
                                        dataItem={dataItem}
                                        timelineIndex={timelineIndex}
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </WorkCreateContext.Provider>
    );
};

export default TimelineSecond;
