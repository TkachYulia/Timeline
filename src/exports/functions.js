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
        timeDisplayable: resultItem.time.getMinutes() === 0,
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

const getClosestTimePoint = (time) => {
    return Math.round(TIME(time) / TIME_STEP) * TIME_STEP;
};

const roundTime = (work) => {
    let roundedStartTime = getClosestTimePoint(work.startTime);
    let roundedFinishTime = getClosestTimePoint(work.finishTime);

    if (TIME(work.startTime) >= TIME(roundedFinishTime)) {
        roundedFinishTime += TIME_STEP;
    }

    return { startTime: roundedStartTime, finishTime: roundedFinishTime };
};

const eraseOverlapWorks = (works) => {
    if (works.length <= 1) {
        return works;
    }

    works.sort((a, b) => TIME(a.finishTime) - TIME(b.finishTime));

    let end = TIME(works[0].finishTime);
    const result = [works[0]];

    for (let i = 1; i < works.length; i++) {
        if (TIME(works[i].startTime) >= end) {
            end = TIME(works[i].finishTime);
            result.push(works[i]);
        }
    }

    return result;
};

export const computeAllWorkSize = (data, timelineTimes) => {
    return data.map((dataItem) => {
        const erasedTimeline = eraseOverlapWorks(dataItem.timeline);
        const computedDataTimeline = erasedTimeline.map((work, workIndex) => {
            const { startTime: computedStartTime, finishTime: computedFinishTime } = roundTime(work);
            return {
                ...work,
                id: `${dataItem.id}-${workIndex + 1}`,
                startTime: computedStartTime,
                finishTime: computedFinishTime,
                originalStartTime: work.startTime,
                originalFinishTime: work.finishTime,
                colSpan: calculateColSpan(computedStartTime, computedFinishTime),
                hiddenRange: [computedStartTime, computedFinishTime],
            };
        });
        const allHiddenRages = computedDataTimeline.map((work) => work.hiddenRange);
        return {
            ...dataItem,
            timeline: computedDataTimeline,
            workCount: {
                original: dataItem.timeline.length,
                erased: erasedTimeline.length,
            },
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

export const getDeepValue = (object, path) => {
    const splittedPath = path.split(".");
    let result = object[splittedPath[0]];

    for (let i = 1; i < splittedPath.length; i++) {
        result = result?.[splittedPath[i]];
    }

    return result;
};

const extractDateTimeInfo = (dateTime) => {
    const lang = "ru-RU";
    const config = "2-digit";
    return {
        date: dateTime.toLocaleString(lang, { day: config, month: config }),
        year: dateTime.getFullYear(),
        time: dateTime.toLocaleString(lang, { hour: config, minute: config, hour12: false }),
    };
};

const joinTime = (startTime, finishTime) => {
    return [startTime, finishTime].join(` \u2013 `);
};

const getFormatted = (dateTime, isTimeDisplayable = false, isYearDisplayable = false) => {
    const result = [dateTime.date];
    if (isYearDisplayable) result[0] += `.${dateTime.year}`;
    if (isTimeDisplayable) result.push(dateTime.time);
    return result.join(" ");
};

export const getTimeRange = (rangeStartTime, rangeFinishTime, forTooltip = false) => {
    const startFormatted = extractDateTimeInfo(new Date(rangeStartTime));
    const finishFormatted = extractDateTimeInfo(new Date(rangeFinishTime));

    if (startFormatted.date === finishFormatted.date && startFormatted.year === finishFormatted.year) {
        return `${forTooltip ? "" : `${getFormatted(startFormatted, false, true)} `}${joinTime(
            startFormatted.time,
            finishFormatted.time
        )}`;
    } else {
        return joinTime(
            ...[startFormatted, finishFormatted].map((formattedTime) =>
                getFormatted(formattedTime, true, startFormatted.year !== finishFormatted.year)
            )
        );
    }
};

export const getTimeCount = (time) => {
    const result = [];
    const hours = Math.floor(time / (60 * 60 * 1000));
    const minutes = Math.floor((time % (60 * 60 * 1000)) / 60000);
    if (hours !== 0) result.push(`${hours} ч`);
    if (minutes !== 0) result.push(`${minutes} мин.`);
    return result.join(" ");
};
