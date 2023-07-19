import { useState } from "react";
import Portal from "./Portal";
import styles from "../main.module.scss";
import { TIME, getTimeCount, getTimeRange } from "../../exports/functions";

function Tooltip({ work, children }) {
    const [coords, setCoords] = useState({ left: 0, top: 0 });
    const tooltipShift = 20;

    const [showTooltip, setShowTooltip] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const handleMouseEnter = () => {
        setTimeoutId(
            setTimeout(() => {
                setShowTooltip(true);
            }, 400)
        );
    };

    const handleMouseLeave = () => {
        clearTimeout(timeoutId);
        setShowTooltip(false);
    };

    const handleMouseMove = (e) => {
        setCoords({
            top: e.clientY + tooltipShift,
            left: e.clientX + tooltipShift,
        });
    };

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}>
            {children}
            {showTooltip && (
                <Portal>
                    <div className={styles.tooltip} style={{ top: coords.top, left: coords.left }}>
                        <strong>{work.workName}</strong>
                        <span>
                            {getTimeRange(work.originalStartTime, work.originalFinishTime, true)} (
                            {getTimeCount(TIME(work.originalFinishTime) - TIME(work.originalStartTime))})
                        </span>
                    </div>
                </Portal>
            )}
        </div>
    );
}

export default Tooltip;
