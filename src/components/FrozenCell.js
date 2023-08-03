import { useContext, useEffect, useRef, useState } from "react";
import styles from "./Timeline.module.scss";
import PropsContext from "../context/PropsContext";

const FrozenCell = ({
    isHeading = false,
    rowSpan = 1,
    columnIndex,
    isLast,
    frozenColumnsWidth,
    updateColumnWidth,
    isContainerScrolled,
    timelineTitleHeight,
    numeredColumnWidth,
    containerWidth,
    children,
}) => {
    const { FUNC } = useContext(PropsContext);
    const [freezeStyles, setFreezeStyles] = useState({});
    const cellRef = useRef(null);

    const computedClassNames = [styles[isHeading ? "th" : "td"], styles.frozen].join(" ");

    const updateFreezeWidth = () => {
        updateColumnWidth(columnIndex, cellRef.current.clientWidth);
    };

    useEffect(() => {
        const debouncedHandleResize = FUNC.DEBOUNCE(updateFreezeWidth, 100);

        window.addEventListener("resize", debouncedHandleResize);
        return () => {
            window.removeEventListener("resize", debouncedHandleResize);
        };
    }, []);

    useEffect(() => {
        if (cellRef.current) {
            updateFreezeWidth();
        }
    }, [cellRef.current, containerWidth]);

    useEffect(() => {
        if (
            frozenColumnsWidth.every((frozenColumnWidth) => frozenColumnWidth.updated) &&
            !!frozenColumnsWidth[columnIndex]
        ) {
            setFreezeStyles(() => ({
                position: "sticky",
                left: `${
                    frozenColumnsWidth.slice(0, columnIndex).reduce((sum, widthItem) => sum + widthItem.width + 1, 0) +
                    numeredColumnWidth
                }px`,
            }));
        }
    }, [frozenColumnsWidth]);

    let shadowStyles = {
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.0)",
        clipPath:
            isHeading && isLast
                ? `polygon(0% 0%, 100% 0%, 100% calc(0% + ${timelineTitleHeight}px), 120% calc(0% + ${timelineTitleHeight}px), 120% 100%, 0% 100%, 0% 0%)`
                : "polygon(0% 0%, 120% 0%, 120% 100%, 0% 100%, 0% 0%)",
    };
    if (isLast && isContainerScrolled) {
        shadowStyles = {
            ...shadowStyles,
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
        };
    }

    if (isHeading)
        return (
            <th
                rowSpan={2}
                className={computedClassNames}
                ref={cellRef}
                style={{ ...freezeStyles, ...shadowStyles }}
                dangerouslySetInnerHTML={{ __html: children }}
            />
        );
    return (
        <td
            className={computedClassNames}
            ref={cellRef}
            rowSpan={rowSpan}
            style={{ ...freezeStyles, ...shadowStyles }}
            dangerouslySetInnerHTML={{ __html: children }}
        />
    );
};

export default FrozenCell;
