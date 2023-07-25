import { useEffect, useState } from "react";
import styles from "./main.module.scss";
import FrozenCell from "./FrozenCell";
import TimelineCell from "./TimelineCell";
import WorkCreateContext from "../context/WorkCreateContext";
import PropsContext from "../context/PropsContext";
import { TOOLTIP_PORTAL_ID, START_ID } from "../exports/constants";
import React, { useRef } from "react";

const defaultFrozenColumns = {
    updated: false,
    width: 100,
};

const Timeline = ({ initProps }) => {
    const {
        columns: tableColumns,
        creatable: timelineCreatable,
        startTime: timelineStartTime,
        finishTime: timelineFinishTime,
        data: initialData,
        byBreakPoint,
        CONST,
        FUNC,
    } = initProps;

    const isTimelineCorrect = timelineStartTime < timelineFinishTime;

    const [timelineTimes, setTimelineTimes] = useState(FUNC.createTimelineTimes(timelineStartTime, timelineFinishTime));
    const [data, setData] = useState(FUNC.formulateWorkTimeline(initialData, timelineTimes));

    const [frozenColumnsWidth, setFrozenColumnsWidth] = useState(tableColumns.map((_) => defaultFrozenColumns));

    const [isCreating, setCreating] = useState(false);
    const [creatingDataId, setCreatingDataId] = useState(null);
    const [creatingDataRowId, setCreatingDataRowId] = useState(null);
    const [creatingStartTime, setCreatingStartTime] = useState(null);
    const [creatingHoverTime, setCreatingHoverTime] = useState(null);
    const [isOverlapping, setOverlapping] = useState(false);
    const [isRightDimension, setRightDimension] = useState(true);
    const [isRightDimensionAvailable, setRightDimensionAvailable] = useState(true);

    const [hoverTime, setHoverTime] = useState(null);
    const [hoverDataId, setHoverDataId] = useState(null);
    const [hoverDataRowId, setHoverDataRowId] = useState(null);

    const containerRef = useRef(null);
    const tableRef = useRef(null);
    const timelineTitleRef = useRef(null);

    const [isContainerScrolled, setContainerScrolled] = useState(false);

    const [timelineTitleHeight, setTimelineTitleHeight] = useState(0);
    const [stickyStyles, setStickyStyles] = useState({});

    useEffect(() => {
        setTimelineTimes(FUNC.createTimelineTimes(timelineStartTime, timelineFinishTime));
    }, [timelineStartTime, timelineFinishTime]);

    useEffect(() => {
        setFrozenColumnsWidth(() => tableColumns.map((_) => defaultFrozenColumns));
    }, [tableColumns]);

    useEffect(() => {
        if (timelineTitleRef.current) {
            setTimelineTitleHeight(() => timelineTitleRef.current.clientHeight);
        }
    }, [timelineTitleRef]);

    const updateColumnWidth = (columnIndex, newWidth) => {
        setFrozenColumnsWidth((prevWidths) =>
            prevWidths.map((prevWidth, index) =>
                columnIndex === index
                    ? {
                          ...prevWidth,
                          updated: true,
                          width: newWidth,
                      }
                    : prevWidth
            )
        );
    };

    const cancelCreating = () => {
        setCreating(false);
        setCreatingDataId(null);
        setCreatingDataRowId(null);
        setCreatingStartTime(null);
        setCreatingHoverTime(null);
        setOverlapping(false);
        setRightDimension(true);
        setRightDimensionAvailable(true);
    };

    const handleClickTimeCell = (id, rowId, timelineTime, tempIsRightDimensionAvailable) => {
        if (isCreating) {
            const startTime = Math.min(creatingStartTime, creatingHoverTime);
            const finishTime = Math.max(creatingStartTime, creatingHoverTime);

            if (!isOverlapping) {
                console.log(`New work created!\n${FUNC.getTimeFormat(startTime)} - ${FUNC.getTimeFormat(finishTime)}`);
                setData((prevData) =>
                    FUNC.formulateWorkTimeline(
                        prevData.map((dataItem) => {
                            if (dataItem.id === id) {
                                return {
                                    ...dataItem,
                                    timeline: [
                                        ...dataItem.timeline,
                                        {
                                            workName: `Новая - ${Math.floor(Math.random() * 20)
                                                .toString()
                                                .padStart(2, "0")}`,
                                            startTime,
                                            finishTime,
                                            color: {
                                                background: "#9ED5C5",
                                                hoverBackground: "#8EC3B0",
                                            },
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
            setCreatingDataRowId(rowId);
            setCreatingStartTime(timelineTime.time);
            const computedHoverTime = tempIsRightDimensionAvailable
                ? FUNC.TIME(timelineTime.time) + CONST.TIME_STEP_CREATE
                : FUNC.TIME(timelineTime.time) - CONST.TIME_STEP_CREATE;
            setCreatingHoverTime(computedHoverTime);
            setOverlapping(false);
            setRightDimension(tempIsRightDimensionAvailable && (timelineTime.isNotCornerCell || timelineTime.isFirstCell));
            setRightDimensionAvailable(tempIsRightDimensionAvailable);
        }
    };

    const workCreateContext = {
        cancelCreating,
        creatingDataId,
        creatingDataRowId,
        creatingHoverTime,
        creatingStartTime,
        handleClickTimeCell,
        hoverDataId,
        hoverDataRowId,
        hoverTime,
        isCreating,
        isOverlapping,
        isRightDimension,
        setCreatingDataRowId,
        setCreatingHoverTime,
        setHoverDataId,
        setHoverDataRowId,
        setHoverTime,
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

    useEffect(() => {
        const checkScrollPosition = () => {
            if (containerRef.current) {
                const scrollLeft = containerRef.current.scrollLeft;
                setContainerScrolled(scrollLeft !== 0);
            }
        };

        if (containerRef.current) {
            containerRef.current.addEventListener("scroll", checkScrollPosition);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener("scroll", checkScrollPosition);
            }
        };
    }, []);

    const getHeadingTitleClasses = (timelineTime) => {
        const resultClasses = [styles.th, styles.time];
        if (FUNC.EQUAL(creatingStartTime, timelineTime.time) || FUNC.EQUAL(creatingHoverTime, timelineTime.time)) {
            resultClasses.push(styles.rangePoints);
            if (isOverlapping) {
                resultClasses.push(styles.error);
            }
        } else if (
            FUNC.EQUAL(hoverTime, timelineTime.time) ||
            (!isCreating &&
                FUNC.EQUAL(
                    isRightDimensionAvailable
                        ? FUNC.TIME(hoverTime) + CONST.TIME_STEP_CREATE
                        : FUNC.TIME(hoverTime) - CONST.TIME_STEP_CREATE,
                    timelineTime.time
                ))
        ) {
            resultClasses.push(styles.hover);
        }
        if (timelineTime.breakPoint) {
            resultClasses.push(styles.breakPoint);
        }
        return resultClasses.join(" ");
    };

    const getTrStyles = (dataItem) => {
        const result = [styles.tr];
        if (dataItem.isEvenRow) {
            result.push(styles.even);
        }
        return result.join(" ");
    };

    useEffect(() => {
        if (frozenColumnsWidth.every((frozenColumnWidth) => frozenColumnWidth.updated)) {
            setStickyStyles(() => ({
                position: "sticky",
                left: `${frozenColumnsWidth.reduce((sum, widthItem) => sum + widthItem.width + 1, 0) + 12}px`,
            }));
        }
    }, [frozenColumnsWidth]);

    const frozenCellProps = (columnIndex) => ({
        columnIndex,
        isLast: columnIndex === tableColumns.length - 1,
        frozenColumnsWidth,
        updateColumnWidth,
        isContainerScrolled,
        timelineTitleHeight,
    });

    return (
        <PropsContext.Provider
            value={{
                timelineStartTime,
                timelineFinishTime,
                byBreakPoint,
                CONST,
                FUNC,
            }}
        >
            <WorkCreateContext.Provider value={workCreateContext}>
                <div className={styles.container} ref={containerRef}>
                    {isTimelineCorrect ? (
                        <table className={styles.table} ref={tableRef}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr}>
                                    {tableColumns.map((column, columnIndex) => (
                                        <FrozenCell isHeading key={`head-${column.param}`} {...frozenCellProps(columnIndex)}>
                                            {column.title}
                                        </FrozenCell>
                                    ))}
                                    <th colSpan={timelineTimes.length || 1} className={styles.th} ref={timelineTitleRef}>
                                        <div className={styles.timelineTitle} style={stickyStyles}>
                                            Шкала работ смены: {FUNC.getTimeRange(timelineStartTime, timelineFinishTime)}
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
                                                style={{ zIndex: (timelineTimes.length - timelineTimeIndex) * 100 }}
                                            >
                                                <div className={styles.helperHead} />
                                                {timelineTime.breakPoint && (
                                                    <div>{FUNC.getTimeFormat(timelineTime.time)}</div>
                                                )}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {data.map((dataItem) => (
                                    <React.Fragment key={dataItem.id}>
                                        <tr className={getTrStyles(dataItem)}>
                                            {tableColumns.map((column, columnIndex) => (
                                                <FrozenCell
                                                    key={`body-${column.param}`}
                                                    rowSpan={dataItem.groupedTimelines?.length}
                                                    {...frozenCellProps(columnIndex)}
                                                >
                                                    {FUNC.getDeepValue(dataItem, column.param)}
                                                </FrozenCell>
                                            ))}
                                            {timelineTimes.map((timelineTime) => (
                                                <TimelineCell
                                                    key={timelineTime.id}
                                                    timelineTime={timelineTime}
                                                    stickyStyles={stickyStyles}
                                                    dataItem={{
                                                        ...dataItem,
                                                        timeline: dataItem.groupedTimelines[0],
                                                        workCellIndexes: dataItem.workCellIndexes[0],
                                                    }}
                                                    rowId={dataItem.groupedTimelines[0][0].rowId}
                                                    isLastGroup={dataItem.groupedTimelines.length === 1}
                                                />
                                            ))}
                                        </tr>
                                        {dataItem.groupedTimelines.slice(1).map((timelineItem, timelineItemIndex) => (
                                            <tr
                                                key={`${dataItem.id}-sub-${timelineItemIndex + 1}`}
                                                className={getTrStyles(dataItem)}
                                            >
                                                {timelineTimes.map((timelineTime) => (
                                                    <TimelineCell
                                                        key={timelineTime.id}
                                                        timelineTime={timelineTime}
                                                        stickyStyles={stickyStyles}
                                                        dataItem={{
                                                            ...dataItem,
                                                            timeline: timelineItem,
                                                            workCellIndexes: dataItem.workCellIndexes[timelineItemIndex + 1],
                                                        }}
                                                        rowId={timelineItem[0].rowId}
                                                        isLastGroup={
                                                            dataItem.groupedTimelines.length - 2 - timelineItemIndex === 0
                                                        }
                                                    />
                                                ))}
                                            </tr>
                                        ))}
                                    </React.Fragment>
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
                                от <q>{FUNC.getDateTime(timelineStartTime)}</q> до{" "}
                                <q>{FUNC.getDateTime(timelineFinishTime)}</q>
                            </span>
                        </div>
                    )}
                    <div id={TOOLTIP_PORTAL_ID} style={{ zIndex: 1000 }} />
                </div>
            </WorkCreateContext.Provider>
        </PropsContext.Provider>
    );
};

export default Timeline;
