import { useContext, useEffect, useRef, useState } from "react";
import styles from "./main.module.scss";
import Tooltip from "./Tooltip";
import PropsContext from "../context/PropsContext";

const CreatedTime = ({ work, stickyStyles }) => {
    const { FUNC } = useContext(PropsContext);
    const [showContent, setShowContent] = useState(true);
    const [isComputed, setComputed] = useState(false);

    const [isHover, setHover] = useState(false);
    const [isStickable, setStickable] = useState(false);

    const containerRef = useRef(null);
    const contentRef = useRef(null);

    const paddingSize = 8;

    useEffect(() => {
        if (containerRef.current && contentRef.current) {
            const containerContentSize = containerRef.current.clientWidth - 2 * paddingSize;
            setStickable(containerContentSize >= contentRef.current.clientWidth);
            setShowContent(containerContentSize >= 20);
            setComputed(true);
        }
    }, [containerRef, contentRef]);

    const handleChangeMouseEnter = () => {
        setHover(true);
    };

    const handleChangeMouseLeave = () => {
        setHover(false);
    };

    return (
        <Tooltip work={work}>
            <a
                ref={containerRef}
                href={work.modalUrl}
                className={styles.createdTime}
                style={{
                    backgroundColor: FUNC.darkenColor(work.color, isHover ? 20 : 0),
                    padding: isComputed ? `0 ${paddingSize}px` : "0",
                }}
                onMouseEnter={handleChangeMouseEnter}
                onMouseLeave={handleChangeMouseLeave}
            >
                <div
                    className={styles.workContainer}
                    style={{
                        ...stickyStyles,
                    }}
                >
                    <div
                        ref={contentRef}
                        className={styles.workName}
                        style={{
                            visibility: isComputed ? "visible" : "hidden",
                            width:
                                isComputed && !isStickable
                                    ? `${containerRef.current.clientWidth - 2 * paddingSize}px`
                                    : "100%",
                        }}
                    >
                        {showContent && work.workName}
                    </div>
                </div>
            </a>
        </Tooltip>
    );
};

export default CreatedTime;
