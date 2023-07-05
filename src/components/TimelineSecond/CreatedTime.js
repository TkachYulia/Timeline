import styles from "./main.module.scss";

const CreatedTime = ({ matchingTimelineWork }) => {
    const computedClassNames = [styles.createdTime];

    return <div className={computedClassNames.join(" ")}>{matchingTimelineWork?.workName || ""}</div>;
};

export default CreatedTime;
