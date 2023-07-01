import { useState } from "react";
import Tippy, { useSingleton } from "@tippyjs/react";
import styles from "./main.module.scss";
import { convertDatetimeToNumericMs, createTimelineTimes, getDateTime, getTimeFormat } from "../../exports/functions";
import { message } from "antd";
import { useEffect } from "react";

const STEP_MINUTES = 15;
const _SHIFTED_TIME_ = new Date();
_SHIFTED_TIME_.setMinutes(new Date().getMinutes() + STEP_MINUTES);
const TIME_STEP = _SHIFTED_TIME_.getTime() - new Date().getTime();

console.log(TIME_STEP);

function createWork(workName, startTimeShift, finishTimeShift) {
    const currentTime = new Date();
    const editedTime = new Date(currentTime);

    editedTime.setHours(9);
    editedTime.setSeconds(0);
    editedTime.setMilliseconds(0);
    editedTime.setMinutes(Math.floor(currentTime.getMinutes() / STEP_MINUTES) * STEP_MINUTES);

    const startTime = new Date(editedTime.getTime() + startTimeShift * 60 * 1000);
    const finishTime = new Date(editedTime.getTime() + finishTimeShift * 60 * 1000);

    return {
        workName,
        startTime,
        finishTime,
    };
}

const exampleDate = [
    {
        id: 1,
        transport: "КАМАЗ 53215 № 2215",
        inventaryNumber: "7036320",
        transportCode: "100500",
        timeline: [createWork("work1", 0, 15), createWork("work2", 60, 120)],
    },
    {
        id: 2,
        transport: "КАМАЗ 53215 № 4487",
        inventaryNumber: "6854998",
        transportCode: "155044",
        timeline: [createWork("work3", 45, 75), createWork("work4", -60, -60)],
    },
];

console.log(exampleDate);

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

const FrozenCell = ({ isLastCell, isHeading = false, children }) => {
    const computedClassNames = [
        styles[isHeading ? "th" : "td"],
        styles.frozen,
        ...(isLastCell ? [styles.lastCell] : []),
    ].join(" ");
    const fixedContent = <div className={styles.fixedContent}>{children}</div>;
    if (isHeading)
        return (
            <th rowSpan={2} className={computedClassNames}>
                {fixedContent}
            </th>
        );
    return <td className={computedClassNames}>{fixedContent}</td>;
};

const CreatedTime = ({ time, dataItem }) => {
    let cellState = "empty";
    let content = "";

    const dataTimeline = dataItem.timeline;

    if (Array.isArray(dataTimeline)) {
        if (
            dataTimeline.some(
                (timelineItem) => timelineItem.startTime.getTime() === time && timelineItem.finishTime.getTime() === time
            )
        ) {
            cellState = "single";
            content = dataTimeline.find(
                (timelineItem) => timelineItem.startTime.getTime() === time && timelineItem.finishTime.getTime() === time
            ).workName;
        } else if (dataTimeline.some((timelineItem) => timelineItem.startTime.getTime() === time)) {
            cellState = "start";
            content = dataTimeline.find((timelineItem) => timelineItem.startTime.getTime() === time).workName;
        } else if (dataTimeline.some((timelineItem) => timelineItem.finishTime.getTime() === time)) {
            cellState = "finish";
            content = dataTimeline.find((timelineItem) => timelineItem.finishTime.getTime() === time).workName;
        } else if (
            dataTimeline.some(
                (timelineItem) => timelineItem.startTime.getTime() <= time && time <= timelineItem.finishTime.getTime()
            )
        ) {
            cellState = "between";
            content = dataTimeline.find(
                (timelineItem) => timelineItem.startTime.getTime() <= time && time <= timelineItem.finishTime.getTime()
            ).workName;
        }
    }

    return <div className={`${styles.createdTime} ${styles[cellState]}`}>{content}</div>;
};

const NewTime = () => {
    return <div className={styles.newTime}></div>;
};

const TimelineCell = ({ time, dataItem }) => {
    time = new Date(time).getTime();

    return (
        <td className={`${styles.td} ${styles.timeCell}`}>
            <CreatedTime time={time} dataItem={dataItem} />
        </td>
    );
};

const TimelineSecond = ({ startTime: timelineStartTime, finishTime: timelineFinishTime }) => {
    const [createStartTime, setCreateStartTime] = useState(null);
    const [createFinishTime, setCreateFinishTime] = useState(null);

    const [timelineTimes, setTimelineTimes] = useState(createTimelineTimes(timelineStartTime, timelineFinishTime));

    useEffect(() => {
        setTimelineTimes(createTimelineTimes(timelineStartTime, timelineFinishTime));
    }, [timelineStartTime, timelineFinishTime]);

    // message.error("Невозможно создать действие: пересечение временных интервалов");

    // Tooltip
    const [source, target] = useSingleton({
        overrides: ["delay", "arrow"],
    });

    return (
        <div className={styles.container}>
            <div>
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
                            <th key={timelineTime.getTime()} className={styles.th}>
                                {getTimeFormat(timelineTime)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.tbody}>
                    {exampleDate.map((dataItem) => (
                        <tr key={dataItem.id} className={styles.tr}>
                            {cellDeployer.map((cellItem, cellIndex) => (
                                <FrozenCell key={`body-${cellItem.param}`} isLastCell={cellIndex === exampleDate.length}>
                                    {dataItem[cellItem.param]}
                                </FrozenCell>
                            ))}
                            {timelineTimes.map((timelineTime) => (
                                <TimelineCell
                                    key={timelineTime.getTime()}
                                    time={timelineTime.getTime()}
                                    dataItem={dataItem}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TimelineSecond;
