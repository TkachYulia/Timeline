import { FINISH_ID, START_ID, STEP_MINUTES, TIME_STEP } from "./constants";

export const TIME = (datetime) => {
    if (!datetime) return new Date().getTime();
    return new Date(datetime).getTime();
};

export const EQUAL = (time1, time2) => {
    return TIME(time1) === TIME(time2);
};

export const BETWEEN = (start, time, finish, isIncludedStart = false, isIncludedFinish = false) => {
    const _start_ = TIME(start);
    const _time_ = TIME(time);
    const _finish_ = TIME(finish);

    const startTimeResult = isIncludedStart ? _start_ <= _time_ : _start_ < _time_;
    const finishTimeResult = isIncludedFinish ? _time_ <= _finish_ : _time_ < _finish_;

    return startTimeResult && finishTimeResult;
};

export const getTimeFormat = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const createWork = (workName, startTime, finishTime) => {
    const currentTime = new Date();
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);

    const computedStartTime = new Date(currentTime);
    computedStartTime.setHours(startTime.split(":")[0]);
    computedStartTime.setMinutes(startTime.split(":")[1]);

    const computedFinishTime = new Date(currentTime);
    computedFinishTime.setHours(finishTime.split(":")[0]);
    computedFinishTime.setMinutes(finishTime.split(":")[1]);

    return {
        workName,
        startTime: computedStartTime,
        finishTime: computedFinishTime,
    };
};

export const getDateTime = (dateTime) => {
    dateTime = new Date(dateTime);
    const day = String(dateTime.getDate()).padStart(2, "0");
    const month = String(dateTime.getMonth() + 1).padStart(2, "0");
    const year = dateTime.getFullYear();
    const hours = String(dateTime.getHours()).padStart(2, "0");
    const minutes = String(dateTime.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

export const createTimelineTimes = (startTime, finishTime) => {
    const result = [];
    let currentTime = startTime;

    while (currentTime <= finishTime) {
        const time = new Date(currentTime);
        [FINISH_ID, START_ID].forEach((timeType) => {
            result.push({
                id: `${timeType}-${time.getTime()}`,
                time,
                type: timeType,
            });
        });
        currentTime = TIME(currentTime) + STEP_MINUTES * 60 * 1000;
    }

    return result.map((resultItem, index) => ({
        ...resultItem,
        order: index,
        isFirstCell: index === 0,
        isNotCornerCell: index !== 0 && index !== result.length - 1,
        isFirstTime: index === 0 || index === 1,
        isLastTime: index === result.length - 1 || index === result.length - 2,
    }));
};

export const calculateColSpan = (startTime, finishTime) => {
    return Math.max(Math.ceil(2 + ((TIME(finishTime) - TIME(startTime)) / TIME_STEP - 1) * 2), 2);
};

export const computeAllWorkSize = (data, timelineTimes) => {
    return data.map((dataItem) => {
        const computedDataTimeline = dataItem.timeline.map((work, workIndex) => ({
            ...work,
            id: `${dataItem.id}-${workIndex + 1}`,
            colSpan: calculateColSpan(work.startTime, work.finishTime),
            hiddenRange: [work.startTime, work.finishTime],
        }));
        const allHiddenRages = computedDataTimeline.map((work) => work.hiddenRange);
        return {
            ...dataItem,
            timeline: computedDataTimeline,
            allHiddenRages,
            workCellIndexes: timelineTimes
                .filter((timelineTime) =>
                    allHiddenRages.some((hiddenRange) =>
                        BETWEEN(hiddenRange[0], timelineTime.time, hiddenRange[1], true, true)
                    )
                )
                .map((timelineTime) => ({
                    displayable: !allHiddenRages.some((hiddenRange) =>
                        BETWEEN(hiddenRange[0], timelineTime.time, hiddenRange[1], false, timelineTime.type !== START_ID)
                    ),
                    enabled:
                        !allHiddenRages.some((hiddenRange) =>
                            EQUAL(hiddenRange[timelineTime.type === FINISH_ID ? 1 : 0], timelineTime.time)
                        ) &&
                        (timelineTime.isNotCornerCell ||
                            !computedDataTimeline.some((computedDataTimelineItem) =>
                                EQUAL(
                                    timelineTime.isFirstCell
                                        ? computedDataTimelineItem.startTime
                                        : computedDataTimelineItem.finishTime,
                                    timelineTime.time
                                )
                            )),
                    id: timelineTime.id,
                    type: timelineTime.type,
                })),
        };
    });
};
