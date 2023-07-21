import { useContext, useEffect, useRef, useState } from "react";
import styles from "./main.module.scss";
import Tooltip from "./Tooltip";
import PropsContext from "../context/PropsContext";

const CreatedTime = ({ work }) => {
    const { FUNC } = useContext(PropsContext);
    const computedClassNames = [styles.createdTime];
    const [showContent, setShowContent] = useState(true);
    const [isComputed, setComputed] = useState(false);

    const [isHover, setHover] = useState(false);

    const containerRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && contentRef.current) {
            const paddingSize = 8;
            setShowContent(
                contentRef.current.clientWidth - paddingSize * 2 > 20 &&
                    containerRef.current.clientHeight > contentRef.current.clientHeight - paddingSize * 2
            );
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
                href={work.modalUrl}
                className={computedClassNames.join(" ")}
                style={{
                    backgroundColor: FUNC.darkenColor(work.color.background, isHover ? 20 : 0),
                }}
                onMouseEnter={handleChangeMouseEnter}
                onMouseLeave={handleChangeMouseLeave}
            >
                <div className={styles.workContainer} ref={containerRef}>
                    <div
                        className={styles.workName}
                        ref={contentRef}
                        style={{
                            visibility: isComputed ? "visible" : "hidden",
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
