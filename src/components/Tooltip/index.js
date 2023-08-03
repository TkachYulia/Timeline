import { useContext, useEffect, useRef, useState } from "react";
import Portal from "./Portal";
import styles from "../Timeline.module.scss";
import PropsContext from "../../context/PropsContext";
import TooltipContext from "../../context/TooltipContext";
import WorkCreateContext from "../../context/WorkCreateContext";

const orZero = (value) => value || 0;

function Tooltip({ active, work, containerPos, children }) {
    const { FUNC } = useContext(PropsContext);
    const { stickyStyles } = useContext(WorkCreateContext);
    const { containerRect, containerScrollRect } = useContext(TooltipContext);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const tooltipRef = useRef(null);

    const updateTooltipPosition = (e) => {
        const computedY = e.pageY - orZero(containerRect.y);
        const computedX = e.pageX - orZero(containerRect.x);
        setCoords({
            top: computedY,
            left: computedX,
        });
    };

    const handleMouseEnter = (e) => {
        updateTooltipPosition(e);
    };

    const handleMouseMove = (e) => {
        updateTooltipPosition(e);
    };

    const isContainerWithScroll = Object.keys(containerScrollRect).length > 1;
    const containerLeftScroll = isContainerWithScroll ? containerScrollRect.left : 0;
    const isTooltipOverflowsRight =
        containerLeftScroll + coords.left + (tooltipRef.current?.clientWidth || 300) >
        containerLeftScroll + containerScrollRect.width - 12;

    let tooltipHorizontalPosition = {};
    if (isTooltipOverflowsRight) {
        tooltipHorizontalPosition = {
            right: `${10 - containerLeftScroll}px`,
        };
    } else {
        tooltipHorizontalPosition = {
            left: `${containerLeftScroll + Math.max(parseInt(stickyStyles.left), coords.left)}px`,
        };
    }

    const computedTooltipStyles = {
        top: `${orZero(containerScrollRect.top) + containerPos.y - containerScrollRect.y + 6}px`,
        ...tooltipHorizontalPosition,
        transform: "translateY(calc(-100% - 4px))",
    };

    return (
        <div className={styles.tooltipContainer} onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove}>
            {children}
            {active && (
                <Portal>
                    <div className={styles.tooltip} ref={tooltipRef} style={computedTooltipStyles}>
                        <div className={styles.tooltipLine} style={{backgroundColor: work.color }} />
                        <div className={styles.content}>
                            <strong dangerouslySetInnerHTML={{ __html: work.workName }} />
                            <span>
                                {FUNC.getTimeRange(work.originalStartTime, work.originalFinishTime, true)} (
                                {FUNC.getTimeCount(FUNC.TIME(work.originalFinishTime) - FUNC.TIME(work.originalStartTime))})
                            </span>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}

export default Tooltip;
