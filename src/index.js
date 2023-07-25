import React from "react";
import ReactDOM from "react-dom/client";
import Timeline from "./components";
import { FINISH_ID, START_ID } from "./exports/constants";

const colors = [
    { background: "#FF9595" }, // Red
    { background: "#ACB7EF" }, // Blue
    { background: "#90E094" }, // Green
    { background: "#FCE08A" }, // Yellow
];

function generateColors() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

const createWork = (workName, startTime, finishTime) => {
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
        color: generateColors(),
    };
};

const deployTimeline = (initProps = {}) => {
    if (!initProps.containerId || !initProps.columns || !initProps.startTime || !initProps.finishTime) return;

    const container = document.getElementById(initProps.containerId);
    const displayStep = initProps.displayStep || 10;
    const createStep = initProps.createStep || 60;
    const totalDuration = TIME(initProps.finishTime) - TIME(initProps.startTime);

    if (!container || totalDuration % displayStep !== 0 || totalDuration % createStep !== 0 || displayStep > createStep)
        return;

    // Constants
    const milliseconds = 60 * 1000;

    const TIME_STEP_DISPLAY = displayStep * milliseconds;

    const CONST = {
        TIME_STEP_DISPLAY,
        TIME_STEP_CREATE: createStep * milliseconds,
    };

    // Functions
    function TIME(datetime) {
        if (!datetime) return new Date().getTime();
        return new Date(datetime).getTime();
    }

    const EQUAL = (time1, time2) => {
        return TIME(time1) === TIME(time2);
    };

    const BETWEEN = (start, time, finish, isIncludedStart = false, isIncludedFinish = false) => {
        const _start_ = TIME(start);
        const _time_ = TIME(time);
        const _finish_ = TIME(finish);

        const startTimeResult = isIncludedStart ? _start_ <= _time_ : _start_ < _time_;
        const finishTimeResult = isIncludedFinish ? _time_ <= _finish_ : _time_ < _finish_;

        return startTimeResult && finishTimeResult;
    };

    const getTimeFormat = (dateTime) => {
        const config = "2-digit";
        return new Date(dateTime).toLocaleTimeString([], { hour: config, minute: config });
    };

    const getDateTime = (dateTime) => {
        const fillString = "0";
        dateTime = new Date(dateTime);
        const day = String(dateTime.getDate()).padStart(2, fillString);
        const month = String(dateTime.getMonth() + 1).padStart(2, fillString);
        const year = dateTime.getFullYear();
        const hours = String(dateTime.getHours()).padStart(2, fillString);
        const minutes = String(dateTime.getMinutes()).padStart(2, fillString);

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    const createTimelineTimes = (startTime, finishTime) => {
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
            currentTime = TIME(currentTime) + TIME_STEP_DISPLAY;
        }

        return result.map((resultItem, index) => {
            const computedNewItem = {
                ...resultItem,
                breakPoint: resultItem.time.getMinutes() === 0,
                order: index,
                isFirstCell: index === 0,
                isNotCornerCell: index !== 0 && index !== result.length - 1,
                isFirstTime: index === 0 || index === 1,
                isLastTime: index === result.length - 1 || index === result.length - 2,
            };
            return computedNewItem;
        });
    };

    const calculateColSpan = (startTime, finishTime) => {
        return Math.max(Math.ceil(2 + ((TIME(finishTime) - TIME(startTime)) / TIME_STEP_DISPLAY - 1) * 2), 2);
    };

    const getClosestTimePoint = (time) => {
        return (
            Math.round(TIME(time) / TIME_STEP_DISPLAY) * TIME_STEP_DISPLAY +
            new Date(initProps.startTime).getMinutes() * milliseconds
        );
    };

    const roundTime = (work) => {
        let roundedStartTime = getClosestTimePoint(work.startTime);
        let roundedFinishTime = getClosestTimePoint(work.finishTime);

        if (TIME(work.startTime) >= TIME(roundedFinishTime)) {
            roundedFinishTime += TIME_STEP_DISPLAY;
        }

        return { startTime: roundedStartTime, finishTime: roundedFinishTime };
    };

    const checkByExtending = (timelineTime, hiddenRange, reversedDirection = false) => {
        const rightCheck = hiddenRange.some((hiddenRangeItem) =>
            BETWEEN(timelineTime.time, hiddenRangeItem, TIME(timelineTime.time) + CONST.TIME_STEP_CREATE)
        );
        const leftCheck = hiddenRange.some((hiddenRangeItem) =>
            BETWEEN(TIME(timelineTime.time) - CONST.TIME_STEP_CREATE, hiddenRangeItem, timelineTime.time)
        );

        const computedForward = reversedDirection ? leftCheck : rightCheck;
        const computedBackward = reversedDirection ? rightCheck : leftCheck;
        return timelineTime.type === FINISH_ID ? computedForward : computedBackward;
    };

    const getGroupedTimeline = (workTimeline) => {
        const result = [[]];
        workTimeline = workTimeline.sort(
            (timelineA, timelineB) =>
                TIME(timelineB.finishTime) -
                TIME(timelineB.startTime) -
                (TIME(timelineA.finishTime) - TIME(timelineA.startTime))
        );

        let currentRangeIndex = 0;
        while (result.map((row) => row.length).reduce((sum, rowLength) => sum + rowLength, 0) !== workTimeline.length) {
            const currentWork = workTimeline[currentRangeIndex];

            let added = false;
            for (let i = 0; i < result.length; i++) {
                if (
                    !result[i].some(
                        (savedWork) =>
                            !(
                                TIME(savedWork.finishTime) <= TIME(currentWork.startTime) ||
                                TIME(currentWork.finishTime) <= TIME(savedWork.startTime)
                            )
                    )
                ) {
                    result[i].push(currentWork);
                    added = true;
                    break;
                }
            }
            if (!added) {
                result.push([currentWork]);
            }
            currentRangeIndex++;
        }

        return result;
    };

    const formulateWorkTimeline = (data, timelineTimes) => {
        return data.map((dataItem, dataItemIndex) => {
            const computedTimelines = getGroupedTimeline(dataItem.timeline);

            const computedDataTimelines = computedTimelines.map((timeline, timelineIndex) =>
                timeline.map((work, workIndex) => {
                    const { startTime: computedStartTime, finishTime: computedFinishTime } = roundTime(work);
                    return {
                        ...work,
                        id: `${dataItem.id}-${timelineIndex + 1}-${workIndex + 1}`,
                        rowId: `${dataItem.id}-${timelineIndex + 1}`,
                        startTime: computedStartTime,
                        finishTime: computedFinishTime,
                        originalStartTime: work.originalStartTime || work.startTime,
                        originalFinishTime: work.originalFinishTime || work.finishTime,
                        colSpan: calculateColSpan(computedStartTime, computedFinishTime),
                        hiddenRange: [computedStartTime, computedFinishTime],
                        isEndsWithBreakPoint: new Date(computedFinishTime).getMinutes() === 0,
                    };
                })
            );
            const hiddenTimelines = computedDataTimelines.map((computedDataTimeline) =>
                computedDataTimeline.map((work) => work.hiddenRange)
            );

            return {
                ...dataItem,
                groupedTimelines: computedDataTimelines,
                isEvenRow: dataItemIndex % 2 === 1,
                hiddenTimelines,
                workCellIndexes: computedDataTimelines.map((_, computedDataTimelineIndex) => {
                    const currentHiddenTimeline = hiddenTimelines[computedDataTimelineIndex];
                    return timelineTimes
                        .filter(
                            (timelineTime) =>
                                currentHiddenTimeline.some(
                                    (hiddenRange) =>
                                        BETWEEN(hiddenRange[0], timelineTime.time, hiddenRange[1], true, true) ||
                                        checkByExtending(timelineTime, hiddenRange, true)
                                ) ||
                                (!timelineTime.isNotCornerCell &&
                                    currentHiddenTimeline.some((hiddenRange) => checkByExtending(timelineTime, hiddenRange)))
                        )
                        .map((timelineTime) => ({
                            displayable: !currentHiddenTimeline.some((hiddenRange) =>
                                BETWEEN(
                                    hiddenRange[0],
                                    timelineTime.time,
                                    hiddenRange[1],
                                    false,
                                    timelineTime.type !== START_ID
                                )
                            ),
                            enabled:
                                !currentHiddenTimeline.some((hiddenRange) =>
                                    EQUAL(hiddenRange[timelineTime.type === FINISH_ID ? 1 : 0], timelineTime.time)
                                ) &&
                                (timelineTime.isNotCornerCell ||
                                    !computedDataTimelines.some((computedDataTimelineItem) =>
                                        EQUAL(
                                            timelineTime.isFirstCell
                                                ? computedDataTimelineItem.startTime
                                                : computedDataTimelineItem.finishTime,
                                            timelineTime.time
                                        )
                                    )) &&
                                !currentHiddenTimeline.some((hiddenRange) =>
                                    timelineTime.isNotCornerCell
                                        ? checkByExtending(timelineTime, hiddenRange, true)
                                        : checkByExtending(timelineTime, hiddenRange)
                                ),
                            id: timelineTime.id,
                            type: timelineTime.type,
                        }));
                }),
            };
        });
    };

    const getDeepValue = (object, path) => {
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

    const getTimeRange = (rangeStartTime, rangeFinishTime, forTooltip = false) => {
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

    const getTimeCount = (time) => {
        const result = [];
        const hours = Math.floor(time / (60 * milliseconds));
        const minutes = Math.floor((time % (60 * milliseconds)) / 60000);
        if (hours !== 0) result.push(`${hours} ч`);
        if (minutes !== 0) result.push(`${minutes} мин.`);
        return result.join(" ");
    };

    const darkenColor = (color, amount) => {
        color = color.replace("#", "");

        if (color.length === 3) {
            color = color
                .split("")
                .map((c) => c + c)
                .join("");
        }

        const colorValue = parseInt(color, 16);

        const darkenedRed = Math.max(0, (colorValue >> 16) - amount);
        const darkenedGreen = Math.max(0, ((colorValue >> 8) & 0xff) - amount);
        const darkenedBlue = Math.max(0, (colorValue & 0xff) - amount);

        const darkenedColor = `#${((darkenedRed << 16) | (darkenedGreen << 8) | darkenedBlue)
            .toString(16)
            .padStart(6, "0")}`;

        return darkenedColor;
    };
    const FUNC = {
        TIME,
        EQUAL,
        BETWEEN,
        getTimeFormat,
        getDateTime,
        createTimelineTimes,
        calculateColSpan,
        formulateWorkTimeline,
        getDeepValue,
        getTimeRange,
        getTimeCount,
        darkenColor,
    };

    const root = ReactDOM.createRoot(container);
    root.render(<Timeline initProps={{ ...initProps, creatable: !!initProps.creatable, CONST, FUNC }} />);
};

deployTimeline({
    containerId: "root",
    startTime: new Date().setHours(7, 0, 0, 0),
    finishTime: new Date().setHours(19, 0, 0, 0),
    creatable: false,
    byBreakPoint: false,
    displayStep: 10,
    createStep: 60,
    columns: [
        {
            title: "Транспорт",
            param: "transport.transportName",
        },
        {
            title: "Инвентарный номер",
            param: "inventaryNumber",
        },
        {
            title: "Код транспорта",
            param: "transportCode",
        },
    ],
    data: [
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215 КАМАЗ 53215 № 2215 555555555555555555587987",
            },
            inventaryNumber: "7036320",
            transportCode: "100500",
            timeline: [
                createWork("Выполнить земляные работы", "8:03", "8:06"),
                createWork("Выполнить земляные работы", "8:01", "8:04"),
                createWork("Выполнить земляные работы", "7:50", "8:09"),
                createWork("Перевезти грунт на склад", "09:00", "12:00"),
                createWork("Обслуживание", "09:00", "10:00"),
                createWork("Подготовить к работе", "11:00", "18:00"),
                createWork("Ремонт", "12:00", "19:00"),
                createWork("Завершить выемку траншеи", "11:00", "18:30"),
            ],
        },
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "7036320",
            transportCode: "100500",
            timeline: [
                createWork("Проверить систему гидравлики", "8:03", "8:08"),
                createWork("Управление движением грузовиков на территории", "9:00", "16:00"),
                createWork("Заправить топливом самосвалы", "08:30", "09:30"),
            ],
        },
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "7036320",
            transportCode: "100500",
            timeline: [
                createWork("Поднять и установить новый ковш", "8:03", "8:16"),
                createWork("Перевезти материалы на строительную площадку", "11:00", "12:20"),
                createWork("Перевезти материалы на строительную площадку 2", "14:00", "18:10"),
            ],
        },
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "7036320",
            transportCode: "100500",
            timeline: [
                createWork("Подготовить экскаватор к утреннему сеансу работы", "8:03", "8:21"),
                createWork("Загрузить самосвалы грунтом", "10:00", "11:30"),
                createWork("Загрузить самосвалы грунтом 2", "15:00", "19:00"),
            ],
        },
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "7036320",
            transportCode: "100500",
            timeline: [
                createWork("Заправить топливом экскаваторы и самосвалы", "7:33", "8:02"),
                createWork("Передвинуть самосвалы на площадку для погрузки", "11:00", "12:00"),
            ],
        },
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "6854998",
            transportCode: "155044",
            timeline: [
                createWork("Удалить и утилизировать отходы с площадки", "7:00", "7:15"),
                createWork("Разгрузить самосвалы на складе", "8:15", "9:15"),
                createWork("Переместить экскаватор на новую строительную площадку", "9:30", "11:15"),
            ],
        },
    ].map((item, index) => ({
        ...item,
        id: index,
        timeline: item.timeline.map((timelineItem) => ({
            ...timelineItem,
            modalUrl: `/some-js-url?withParams=${timelineItem.workName}&index=${index}`,
        })),
    })),
});

export { deployTimeline };
