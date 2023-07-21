import { useContext, useEffect, useState } from "react";
import Portal from "./Portal";
import styles from "../main.module.scss";
import PropsContext from "../../context/PropsContext";

function Tooltip({ work, children }) {
    const { FUNC } = useContext(PropsContext);
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
