import React from "react";
import ReactDOM from "react-dom/client";
import Timeline from "./components";
import { FINISH_ID, START_ID } from "./exports/constants";

function DATE(time) {
    if (!time) return DATE_MINUS_LOCAL_TZ();
    return new Date(time);
}

function DATE_MINUS_LOCAL_TZ(time = new Date().getTime()) {
    const receivedTime = new Date(time);
    const timezoneOffsetInMinutes = receivedTime.getTimezoneOffset();
    receivedTime.setMinutes(receivedTime.getMinutes() + timezoneOffsetInMinutes);
    return receivedTime;
}

const colors = [
    "#FF9595", // Red
    "#ACB7EF", // Blue
    "#90E094", // Green
    "#FCE08A", // Yellow
];

function generateColors() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

const createWork = (workName, startTime, finishTime) => {
    const currentTime = new Date();
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);

    const computedStartTime = DATE(currentTime);
    computedStartTime.setHours(startTime.split(":")[0]);
    computedStartTime.setMinutes(startTime.split(":")[1]);

    const computedFinishTime = DATE(currentTime);
    computedFinishTime.setHours(finishTime.split(":")[0]);
    computedFinishTime.setMinutes(finishTime.split(":")[1]);

    return {
        workName,
        startTime: computedStartTime.getTime(),
        finishTime: computedFinishTime.getTime(),
        color: generateColors(),
    };
};

const deployTimeline = (initProps = {}) => {
    if (typeof initProps === "string") {
        try {
            initProps = JSON.parse(initProps);
        } catch (error) {
            return;
        }
    }
    const container = document.getElementById(initProps.containerId);
    const displayStep = initProps.displayStep || 10;
    const createStep = initProps.createStep || 60;
    const totalDuration = TIME(initProps.finishTime) - TIME(initProps.startTime);

    let ERROR = null;
    const listRequiredParams = ["containerId", "startTime", "finishTime", "columns", "data"];
    if (listRequiredParams.some((requiredParam) => !initProps[requiredParam])) {
        ERROR = (
            <>
                {listRequiredParams
                    .filter((requiredParam) => !initProps[requiredParam])
                    .map((requiredParam) => (
                        <strong key={requiredParam}>Отсутствует параметр {requiredParam}!</strong>
                    ))}
            </>
        );
    }

    initProps.startTime = DATE_MINUS_LOCAL_TZ(initProps.startTime).getTime();
    initProps.finishTime = DATE_MINUS_LOCAL_TZ(initProps.finishTime).getTime();

    if (!container) {
        if (initProps.containerId) {
            console.error(`Не найден контейнер с id "${initProps.containerId}"!`);
        } else {
            console.error(`Отсутствует containerId!`);
        }
        return;
    } else if (initProps.startTime >= initProps.finishTime) {
        ERROR = (
            <>
                <strong>Некорректный временной диапазон!</strong>
                <span>
                    от <q>{getDateTime(initProps.startTime)}</q> до <q>{getDateTime(initProps.finishTime)}</q>
                </span>
            </>
        );
    } else if (totalDuration % displayStep !== 0) {
        ERROR = <strong>Общее время не кратно {displayStep} (displayStep)!</strong>;
    } else if (totalDuration % createStep !== 0) {
        ERROR = <strong>Общее время не кратно {createStep} (createStep)!</strong>;
    } else if (displayStep > createStep) {
        ERROR = (
            <strong>
                {displayStep} (displayStep) не может быть больше {createStep} (createStep)!
            </strong>
        );
    } else if (createStep % displayStep !== 0) {
        ERROR = (
            <strong>
                {createStep} (createStep) не кратно {displayStep} (displayStep)!
            </strong>
        );
    }

    // Constants
    const milliseconds = 60 * 1000;

    const TIME_STEP_DISPLAY = displayStep * milliseconds;

    const CONST = {
        ERROR,
        TIME_STEP_DISPLAY,
        TIME_STEP_CREATE: createStep * milliseconds,
    };

    // Functions
    function DATE(time) {
        if (!time) return DATE_MINUS_LOCAL_TZ();
        return new Date(time);
    }

    function DATE_MINUS_LOCAL_TZ(time = new Date().getTime()) {
        const receivedTime = new Date(time);
        const timezoneOffsetInMinutes = receivedTime.getTimezoneOffset();
        receivedTime.setMinutes(receivedTime.getMinutes() + timezoneOffsetInMinutes);
        return receivedTime;
    }

    function TIME(datetime) {
        return DATE(datetime).getTime();
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

    const ARRAY = (value) => (Array.isArray(value) ? value : []);

    const DEBOUNCE = (fn, delay) => {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    const getTimeFormat = (dateTime) => {
        const config = "2-digit";
        return DATE(dateTime).toLocaleTimeString([], { hour: config, minute: config });
    };

    function getDateTime(dateTime) {
        const fillString = "0";
        dateTime = DATE(dateTime);
        const day = String(dateTime.getDate()).padStart(2, fillString);
        const month = String(dateTime.getMonth() + 1).padStart(2, fillString);
        const year = dateTime.getFullYear();
        const hours = String(dateTime.getHours()).padStart(2, fillString);
        const minutes = String(dateTime.getMinutes()).padStart(2, fillString);

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    const createTimelineTimes = (startTime, finishTime) => {
        const result = [];
        let currentTime = startTime;

        while (currentTime <= finishTime) {
            const time = DATE(currentTime);
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
            DATE(initProps.startTime).getMinutes() * milliseconds
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
                    work.startTime = DATE_MINUS_LOCAL_TZ(work.startTime).getTime();
                    work.finishTime = DATE_MINUS_LOCAL_TZ(work.finishTime).getTime();
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
                        isEndsWithBreakPoint: DATE(computedFinishTime).getMinutes() === 0,
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
        const startFormatted = extractDateTimeInfo(DATE(rangeStartTime));
        const finishFormatted = extractDateTimeInfo(DATE(rangeFinishTime));

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

    const filterUnique = (arr) => {
        const seenValues = new Set();
        return ARRAY(arr).filter((item) => {
            if (!seenValues.has(item.param)) {
                seenValues.add(item.param);
                return true;
            }
            return false;
        });
    };
    const filteredColumns = filterUnique(initProps.columns);

    const FUNC = {
        TIME,
        EQUAL,
        BETWEEN,
        DEBOUNCE,
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

    const getString = (value, defaultValue = "") => {
        if (!value || typeof value !== "string") return defaultValue;
        return value;
    };

    const root = ReactDOM.createRoot(container);
    root.render(
        <Timeline
            initProps={{
                ...initProps,
                creatable: !!initProps.creatable,
                byBreakPoint: !!initProps.byBreakPoint,
                data: ARRAY(initProps.data),
                columns: filteredColumns,
                numberedColumnTitle: getString(initProps.numberedColumnTitle, "п/п"),
                timelineTitle: getString(initProps.timelineTitle),
                CONST,
                FUNC,
            }}
        />
    );
};

deployTimeline({
    containerId: "root",
    startTime: 1688371200000,
    finishTime: 1688414400000,
    timelineTitle: "Дата: 03.07.2023, Режим работы: 2я смена, Время: 08:00 - 20:00",
    columns: [
        {
            title: "Марка ТС",
            param: "modelName",
        },
        {
            title: "Гос. номер",
            param: "transportNo",
        },
        {
            title: "Гар. номер",
            param: "garageNo",
        },
    ],
    data: [
        {
            id: 1,
            modelName: "ЧСДМ ДЗ-98",
            transportNo: "S390ACD",
            garageNo: "",
            timeline: [
                {
                    workName: "1. Техническое обслуживание - ",
                    startTime: 1688385600000,
                    finishTime: 1688389800000,
                    color: "#F2DCDB",
                    modalUrl:
                        "javascript:apex.navigation.dialog('f?p=443:415:14774696435957:::CIR,415:P415_BID_ID,P415_DRAFT_ID:,64\u0026cs=3dWvvyYXh8M8QT0sZLy9I5WZGylTgrr-2I_x5Jl5152AxlJlFAr-qrW0xOj7rfTRL_iulz-UTNRlNCgvNphLL9A\u0026p_dialog_cs=E5uoUhy0xJi7sd2Ah-JYlTdqpIuCNzGmn4uvspitt4usiQkR1vQLWQKpWOXJKJBxH4KllBQxV0pab9hrYmN9mg',{title:'\u0424\u043E\u0440\u043C\u0430 \u0022\u0417\u0430\u044F\u0432\u043A\u0430 \u0422\u002F\u0421\u0022',height:'auto',width:'720',maxWidth:'960',modal:true,dialog:null},'t-Dialog-page--standard '+'',this);",
                },
                {
                    workName: "2. Техническое обслуживание - ",
                    startTime: 1688385600000 + 7 * 60 * 60 * 1000,
                    finishTime: 1688389800000 + 7 * 60 * 60 * 1000 - 10 * 60 * 1000,
                    color: "#CDB",
                    modalUrl:
                        "javascript:apex.navigation.dialog('f?p=443:415:14774696435957:::CIR,415:P415_BID_ID,P415_DRAFT_ID:,64\u0026cs=3dWvvyYXh8M8QT0sZLy9I5WZGylTgrr-2I_x5Jl5152AxlJlFAr-qrW0xOj7rfTRL_iulz-UTNRlNCgvNphLL9A\u0026p_dialog_cs=E5uoUhy0xJi7sd2Ah-JYlTdqpIuCNzGmn4uvspitt4usiQkR1vQLWQKpWOXJKJBxH4KllBQxV0pab9hrYmN9mg',{title:'\u0424\u043E\u0440\u043C\u0430 \u0022\u0417\u0430\u044F\u0432\u043A\u0430 \u0422\u002F\u0421\u0022',height:'auto',width:'720',maxWidth:'960',modal:true,dialog:null},'t-Dialog-page--standard '+'',this);",
                },
            ],
        },
        {
            id: 2,
            modelName: "АЦ-3.2-40",
            transportNo: "S994MA",
            garageNo: "",
            timeline: [
                {
                    workName: "1. Техническое обслуживание - ТО (Замена двигателя)",
                    startTime: 1688396400000,
                    finishTime: 1688414400000,
                    color: "#F2DCDB",
                    modalUrl:
                        "javascript:apex.navigation.dialog('f?p=443:415:14774696435957:::CIR,415:P415_BID_ID,P415_DRAFT_ID:,105\u0026cs=3a_cddtXfI3WVDyv0RtUhw5CYyoTrTLxDH9ydEn078_MlJ8t0DqwpqMCT6vjR1a1-aKdvo0q8qMuvCYMWb-Rjgg\u0026p_dialog_cs=E5uoUhy0xJi7sd2Ah-JYlTdqpIuCNzGmn4uvspitt4usiQkR1vQLWQKpWOXJKJBxH4KllBQxV0pab9hrYmN9mg',{title:'\u0424\u043E\u0440\u043C\u0430 \u0022\u0417\u0430\u044F\u0432\u043A\u0430 \u0422\u002F\u0421\u0022',height:'auto',width:'720',maxWidth:'960',modal:true,dialog:null},'t-Dialog-page--standard '+'',this);",
                },
                {
                    workName: "1. Техническое обслуживание - ТО (Замена двигателя)",
                    startTime: 1688396400000 - 3 * 60 * 60 * 1000,
                    finishTime: 1688414400000 - 4 * 60 * 60 * 1000,
                    color: "#FDB",
                    modalUrl:
                        "javascript:apex.navigation.dialog('f?p=443:415:14774696435957:::CIR,415:P415_BID_ID,P415_DRAFT_ID:,105\u0026cs=3a_cddtXfI3WVDyv0RtUhw5CYyoTrTLxDH9ydEn078_MlJ8t0DqwpqMCT6vjR1a1-aKdvo0q8qMuvCYMWb-Rjgg\u0026p_dialog_cs=E5uoUhy0xJi7sd2Ah-JYlTdqpIuCNzGmn4uvspitt4usiQkR1vQLWQKpWOXJKJBxH4KllBQxV0pab9hrYmN9mg',{title:'\u0424\u043E\u0440\u043C\u0430 \u0022\u0417\u0430\u044F\u0432\u043A\u0430 \u0422\u002F\u0421\u0022',height:'auto',width:'720',maxWidth:'960',modal:true,dialog:null},'t-Dialog-page--standard '+'',this);",
                },
            ],
        },
    ],
});

window.deployTimeline = deployTimeline;
