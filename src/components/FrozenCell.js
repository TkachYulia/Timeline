import { useEffect, useRef } from "react";
import styles from "./main.module.scss";

const FrozenCell = ({
    isHeading = false,
    rowSpan = 1,
    columnIndex,
    isLast,
    frozenColumnsWidth,
    updateColumnWidth,
    isContainerScrolled,
    timelineTitleHeight,
    children,
}) => {
    const cellRef = useRef(null);

    const computedClassNames = [styles[isHeading ? "th" : "td"], styles.frozen].join(" ");

    useEffect(() => {
        if (cellRef.current && isHeading) {
            updateColumnWidth(columnIndex, cellRef.current.clientWidth);
        }
    }, [cellRef.current]);

    let freezeStyles = {};
    if (frozenColumnsWidth.every((frozenColumnWidth) => frozenColumnWidth.updated) && !!frozenColumnsWidth[columnIndex]) {
        freezeStyles = {
            position: "sticky",
            left: `${frozenColumnsWidth.slice(0, columnIndex).reduce((sum, widthItem) => sum + widthItem.width + 1, 0)}px`,
        };
    }

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
            <th rowSpan={2} className={computedClassNames} ref={cellRef} style={{ ...freezeStyles, ...shadowStyles }}>
                {children}
            </th>
        );
    return (
        <td className={computedClassNames} rowSpan={rowSpan} style={{ ...freezeStyles, ...shadowStyles }}>
            {children}
        </td>
    );
};

export default FrozenCell;
