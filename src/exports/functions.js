import { STEP_MINUTES, TIME_STEP } from "./constants";

export const GET_TIME = (datetime) => {
    if (!datetime) return new Date().getTime();
    return new Date(datetime).getTime();
};

export const getTimeFormat = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const createWork = (workName, startTimeShift, finishTimeShift) => {
    const currentTime = new Date();
    const shiftedTime = new Date(currentTime);
    shiftedTime.setHours(8);
    const editedTime = roundTimeByStep(shiftedTime);

    const startTime = new Date(editedTime.getTime() + startTimeShift * 60 * 1000);
    const finishTime = new Date(
        editedTime.getTime() + finishTimeShift * 60 * 1000 + (startTimeShift === finishTimeShift ? TIME_STEP : 0)
    );

    return {
        workName,
        startTime,
        finishTime,
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
        result.push(new Date(currentTime));
        currentTime = GET_TIME(currentTime) + STEP_MINUTES * 60 * 1000;
    }

    return result;
};

const calculateWorkSize = (work) => {
    return (GET_TIME(work.finishTime) - GET_TIME(work.startTime)) / TIME_STEP + 1;
};

export const computeAllWorkSize = (data, timelineTimes) => {
    return data.map((dataItem) => {
        const computedDataTimeline = dataItem.timeline.map((work, workIndex) => ({
            ...work,
            id: `${dataItem.id}-${workIndex + 1}`,
            colSpan: calculateWorkSize(work),
        }));
        return {
            ...dataItem,
            timeline: computedDataTimeline,
            workCellIndexes: [...timelineTimes]
                .map((timelineTime, timelineIndex) => ({
                    time: timelineTime,
                    index: timelineIndex,
                }))
                .filter((timelineTime) =>
                    computedDataTimeline.some(
                        (dataTimeline) =>
                            GET_TIME(dataTimeline.startTime) <= GET_TIME(timelineTime.time) &&
                            GET_TIME(timelineTime.time) <= GET_TIME(dataTimeline.finishTime)
                    )
                )
                .map((timelineTime) => ({
                    isStart: computedDataTimeline.some(
                        (dataTimeline) => GET_TIME(dataTimeline.startTime) === GET_TIME(timelineTime.time)
                    ),
                    index: timelineTime.index,
                })),
        };
    });
};

export const roundTimeByStep = (time) => {
    time = time || new Date();
    const resultTime = new Date(time);

    resultTime.setSeconds(0);
    resultTime.setMilliseconds(0);
    resultTime.setMinutes(Math.floor(time.getMinutes() / STEP_MINUTES) * STEP_MINUTES);

    return resultTime;
};
