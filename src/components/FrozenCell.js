import styles from "./main.module.scss";

const FrozenCell = ({ isLastCell, isHeading = false, children }) => {
    const computedClassNames = [
        styles[isHeading ? "th" : "td"],
        styles.frozen,
        ...(isLastCell ? [styles.lastCell] : []),
    ].join(" ");
    const fixedContent = <div className={styles.fixedContent}>{children}</div>;
    if (isHeading)
        return (
            <th rowSpan={2} className={computedClassNames}>
                {fixedContent}
            </th>
        );
    return <td className={computedClassNames}>{fixedContent}</td>;
};

export default FrozenCell;
