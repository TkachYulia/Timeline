import { useContext, useEffect, useRef, useState } from "react";
import Portal from "./Portal";
import styles from "../main.module.scss";
import PropsContext from "../../context/PropsContext";
import TooltipContext from "../../context/TooltipContext";

function Tooltip({ work, children }) {
    const { FUNC } = useContext(PropsContext);
    const { lastTooltipHoverWorkId, setLastTooltipHoverWorkId } = useContext(TooltipContext);
    const [coords, setCoords] = useState({ left: 0, top: 0 });
    const tooltipShift = 20;
    const tooltipScreenPadding = 10;

    const [showTooltip, setShowTooltip] = useState(false);

    const [isRightAvailable, setRightAvailable] = useState(true);
    const [isDownAvailable, setDownAvailable] = useState(true);

    const tooltipRef = useRef(null);

    const updateTooltipPosition = (e) => {
        setCoords({
            top: e.clientY,
            left: e.clientX,
        });
        if (tooltipRef.current) {
            setRightAvailable(
                e.clientX + tooltipShift + tooltipRef.current.clientWidth + tooltipScreenPadding <= window.innerWidth
            );
            setDownAvailable(
                e.clientY + tooltipShift + tooltipRef.current.clientHeight + tooltipScreenPadding <= window.innerHeight
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
        top: isDownAvailable
            ? coords.top + tooltipShift
            : coords.top - tooltipShift - (tooltipRef.current?.clientHeight || 0),
        left: isRightAvailable
            ? coords.left + tooltipShift
            : coords.left - tooltipShift - (tooltipRef.current?.clientWidth || 0),
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
