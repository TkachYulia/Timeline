import { useContext, useEffect, useRef, useState } from "react";
import Portal from "./Portal";
import styles from "../main.module.scss";
import PropsContext from "../../context/PropsContext";
import TooltipContext from "../../context/TooltipContext";

const orZero = (value) => value || 0;

function Tooltip({ work, children }) {
    const { FUNC } = useContext(PropsContext);
    const { lastTooltipHoverWorkId, setLastTooltipHoverWorkId, containerRect, containerScrollRect } =
        useContext(TooltipContext);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const tooltipShift = 20;
    const tooltipScreenPadding = 30;

    const [showTooltip, setShowTooltip] = useState(false);

    const [isRightAvailable, setRightAvailable] = useState(true);
    const [isDownAvailable, setDownAvailable] = useState(true);

    const tooltipRef = useRef(null);

    const updateTooltipPosition = (e) => {
        const computedY = e.pageY - orZero(containerRect.y);
        const computedX = e.pageX - orZero(containerRect.x);
        setCoords({
            top: computedY,
            left: computedX,
        });
        if (tooltipRef.current) {
            setRightAvailable(
                computedX + tooltipShift + tooltipRef.current.clientWidth + tooltipScreenPadding <=
                    orZero(containerRect.width)
            );
            setDownAvailable(
                computedY + tooltipShift + tooltipRef.current.clientHeight + tooltipScreenPadding <=
                    orZero(containerRect.height)
            );
        }
    };

    const handleMouseEnter = (e) => {
        setShowTooltip(true);
        setLastTooltipHoverWorkId(work.id);
        updateTooltipPosition(e);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    useEffect(() => {
        if (lastTooltipHoverWorkId !== work.id) {
            handleMouseLeave();
        }
    }, [lastTooltipHoverWorkId]);

    const handleMouseMove = (e) => {
        updateTooltipPosition(e);
    };

    const computedTooltipStyles = {
        top:
            containerScrollRect.top +
            (isDownAvailable
                ? coords.top + tooltipShift
                : coords.top - tooltipShift - (tooltipRef.current?.clientHeight || 0)),
        left:
            containerScrollRect.left +
            (isRightAvailable
                ? coords.left + tooltipShift
                : coords.left - tooltipShift - (tooltipRef.current?.clientWidth || 0)),
    };

    return (
        <div
            className={styles.tooltipContainer}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {children}
            {showTooltip && (
                <Portal>
                    <div className={styles.tooltip} ref={tooltipRef} style={computedTooltipStyles}>
                        <strong>{work.workName}</strong>
                        <span>
                            {FUNC.getTimeRange(work.originalStartTime, work.originalFinishTime, true)} (
                            {FUNC.getTimeCount(FUNC.TIME(work.originalFinishTime) - FUNC.TIME(work.originalStartTime))})
                        </span>
                    </div>
                </Portal>
            )}
        </div>
    );
}

export default Tooltip;
