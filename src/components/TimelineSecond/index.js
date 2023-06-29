import { useState } from "react";
import Tippy, { useSingleton } from "@tippyjs/react";
import styles from "./main.module.css";
import { convertDatetimeToNumericMs } from "../../exports/functions";
import { message } from "antd";

const TimeCell = ({ dateTime, singletonTarget, startCreate }) => {
    const currentDateTime = new Date(dateTime);
    const timeSteps = [...Array(4)].map((_, order) => new Date(new Date(dateTime).setMinutes(15 * order)));

    const timeFormat = (DATE) => {
        return DATE.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const handleClick = (cellDateTime, event) => {
        const minuteCell = event.target;
        const hourCell = minuteCell.parentNode.parentNode;

        const minuteCellRect = minuteCell.getBoundingClientRect();
        const hourCellRect = hourCell.getBoundingClientRect();

        const resultLeftOffset = minuteCellRect.left - hourCellRect.left + hourCell.offsetLeft;

        startCreate({
            time: convertDatetimeToNumericMs(cellDateTime),
            start: resultLeftOffset,
        });
    };

    return (
        <div className={styles.timeCell}>
            <div className={styles.header}>{timeFormat(currentDateTime)}</div>
            <div className={styles.steps}>
                {timeSteps.map((timeItem) => (
                    <Tippy
                        key={`cell-${convertDatetimeToNumericMs(timeItem)}`}
                        content={timeFormat(timeItem)}
                        singleton={singletonTarget}
                        delay={0}
                        arrow={false}
                    >
                        <div className={styles.step} onClick={(event) => handleClick(timeItem, event)}></div>
                    </Tippy>
                ))}
            </div>
        </div>
    );
};

const ReservedTimeCell = ({ timeCell, isPoint = false }) => {
    const style = {
        width: `${isPoint ? 24 : Math.abs(timeCell.start - timeCell.end)}px`,
        height: "40px",
        position: "absolute",
        left: `${timeCell.start}px`,
        bottom: "3px",
        backgroundColor: "coral",
    };
    return <div style={style}></div>;
};

const TimelineSecond = () => {
    const [startTime, setStartTime] = useState(null);
    const [createdTimes, setCreatedTimes] = useState([]);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const selectedDateWithTime = new Date(selectedDate).setHours(0, 0, 0, 0);
    const hourSteps = [...Array(24)].map((_, order) => new Date(selectedDateWithTime).setHours(1 * order));
    const [source, target] = useSingleton({
        overrides: ["delay", "arrow"],
    });

    const handleChangeDate = (e) => {
        setSelectedDate(e.target.value);
    };

    const startCreate = (time) => {
        if (createdTimes.some((createdTime) => createdTime.start >= time.start && time.start <= createdTime.end)) {
            message.error("Невозможно создать действие: пересечение временных интервалов");
        } else {
            setStartTime(time);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.dateContainer}>
                <span>Дата:</span>
                <input type="date" onChange={handleChangeDate} value={selectedDate} />
            </div>
            <Tippy singleton={source} delay={500} />
            {!!selectedDate && (
                <div className={styles.timeline}>
                    {hourSteps.map((hourItem) => (
                        <TimeCell
                            dateTime={hourItem}
                            singletonTarget={target}
                            startCreate={startCreate}
                            key={convertDatetimeToNumericMs(hourItem)}
                        />
                    ))}
                    {!!startTime && <ReservedTimeCell timeCell={startTime} isPoint />}
                    {createdTimes.map((createdTime) => (
                        <ReservedTimeCell timeCell={createdTime} key={createdTime.offset} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimelineSecond;
