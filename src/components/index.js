import { useEffect, useState } from "react";
import styles from "./Timeline.module.scss";
import FrozenCell from "./FrozenCell";
import TimelineCell from "./TimelineCell";
import WorkCreateContext from "../context/WorkCreateContext";
import PropsContext from "../context/PropsContext";
import TooltipContext from "../context/TooltipContext";
import { TOOLTIP_PORTAL_ID, START_ID } from "../exports/constants";
import React, { useRef } from "react";

const defaultFrozenColumns = {
    updated: false,
    width: 100,
};

const stickyOffsetSize = 12;

const Timeline = ({ initProps }) => {
    const tooltipContainerId = `${initProps.containerId}_${TOOLTIP_PORTAL_ID}`;
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
    const numeredColumnRef = useRef(null);

    const [isContainerScrolled, setContainerScrolled] = useState(false);
    const [containerScrollRect, setContainerScrollRect] = useState({});

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
        stickyStyles,
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
                document.removeEventListener("click", handleClickOutside);
            };
        }
    }, [isCreating]);

    const getContainerScrollRect = () => ({
        top: containerRef.current?.scrollTop || 0,
        left: containerRef.current?.scrollLeft || 0,
        y: containerRef.current?.getBoundingClientRect()?.y || 0,
        width: containerRef.current?.clientWidth || 0,
    });

    const updateContainerScrollRect = () => {
        setContainerScrollRect(getContainerScrollRect());
    };

    useEffect(() => {
        if (containerScrollRect.y !== containerRef.current?.getBoundingClientRect()?.y) {
            updateContainerScrollRect();
        }
    }, [containerRef.current?.getBoundingClientRect()]);

    useEffect(() => {
        const checkScrollPosition = () => {
            if (containerRef.current) {
                const scrollLeft = containerRef.current.scrollLeft;
                setContainerScrolled(scrollLeft !== 0);
            }
        };

        const debouncedHandleResize = FUNC.DEBOUNCE(updateContainerScrollRect, 50);

        if (containerRef.current) {
            containerRef.current.addEventListener("scroll", checkScrollPosition);
            containerRef.current.addEventListener("scroll", debouncedHandleResize);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener("scroll", checkScrollPosition);
                containerRef.current.removeEventListener("scroll", debouncedHandleResize);
            }
        };
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            updateContainerScrollRect();
        }

        const debouncedHandleResize = FUNC.DEBOUNCE(updateContainerScrollRect, 100);

        window.addEventListener("resize", debouncedHandleResize);
        return () => {
            window.removeEventListener("resize", debouncedHandleResize);
        };
    }, [containerRef]);

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

    const numeredColumnWidth = numeredColumnRef.current?.clientWidth ? numeredColumnRef.current?.clientWidth + 1 : 0;

    useEffect(() => {
        if (frozenColumnsWidth.every((frozenColumnWidth) => frozenColumnWidth.updated)) {
            setStickyStyles(() => ({
                position: "sticky",
                left: `${
                    frozenColumnsWidth.reduce((sum, widthItem) => sum + widthItem.width + 1, 0) +
                    stickyOffsetSize +
                    numeredColumnWidth
                }px`,
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
        numeredColumnWidth,
        containerWidth: containerRef.current?.clientWidth || 0,
    });

    return (
        <PropsContext.Provider
            value={{
                timelineStartTime,
                timelineFinishTime,
                byBreakPoint,
                CONST,
                FUNC,
                tooltipContainerId,
            }}
        >
            <TooltipContext.Provider
                value={{
                    containerRect: containerRef.current?.getBoundingClientRect() || {},
                    containerScrollRect,
                    stickyOffsetSize,
                }}
            >
                <WorkCreateContext.Provider value={workCreateContext}>
                    <div className={styles.container} ref={containerRef}>
                        {!CONST.ERROR ? (
                            <table className={styles.table} ref={tableRef}>
                                <thead className={styles.thead}>
                                    <tr className={styles.tr}>
                                        <th
                                            className={`${styles.th} ${styles.numeredColumn}`}
                                            ref={numeredColumnRef}
                                            rowSpan={2}
                                        >
                                            {initProps.numberedColumnTitle}
                                        </th>
                                        {tableColumns.map((column, columnIndex) => (
                                            <FrozenCell
                                                isHeading
                                                key={`head-${column.param}`}
                                                {...frozenCellProps(columnIndex)}
                                            >
                                                {column.title}
                                            </FrozenCell>
                                        ))}
                                        <th colSpan={timelineTimes.length || 1} className={styles.th} ref={timelineTitleRef}>
                                            <div
                                                className={styles.timelineTitle}
                                                style={stickyStyles}
                                                dangerouslySetInnerHTML={{ __html: initProps.timelineTitle }}
                                            />
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
                                    {data.length > 0 ? (
                                        data.map((dataItem) => (
                                            <React.Fragment key={dataItem.id}>
                                                <tr className={getTrStyles(dataItem)}>
                                                    <td
                                                        className={`${styles.td} ${styles.numeredColumn}`}
                                                        rowSpan={dataItem.groupedTimelines.length}
                                                    >
                                                        {dataItem.no}
                                                    </td>
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
                                                            rowId={dataItem.groupedTimelines[0][0]?.rowId}
                                                            isLastGroup={dataItem.groupedTimelines.length === 1}
                                                        />
                                                    ))}
                                                </tr>
                                                {dataItem.groupedTimelines
                                                    .slice(1)
                                                    .map((timelineItem, timelineItemIndex) => (
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
                                                                        workCellIndexes:
                                                                            dataItem.workCellIndexes[timelineItemIndex + 1],
                                                                    }}
                                                                    rowId={timelineItem[0].rowId}
                                                                    isLastGroup={
                                                                        dataItem.groupedTimelines.length -
                                                                            2 -
                                                                            timelineItemIndex ===
                                                                        0
                                                                    }
                                                                />
                                                            ))}
                                                        </tr>
                                                    ))}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr className={`${styles.tr} ${styles.empty}`}>
                                            <td className={styles.td} colSpan={tableColumns.length + timelineTimes.length}>
                                                <div
                                                    className={styles.messageContainer}
                                                    style={{
                                                        width: `${containerRef.current?.clientWidth || 0}px`,
                                                    }}
                                                >
                                                    Нет данных
                                                </div>
                                            </td>
                                        </tr>
                                    )}
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
                            <div className={styles.errorMessage}>{CONST.ERROR}</div>
                        )}
                        <div id={tooltipContainerId} style={{ zIndex: 1000 }} />
                    </div>
                </WorkCreateContext.Provider>
            </TooltipContext.Provider>
        </PropsContext.Provider>
    );
};

export default Timeline;
