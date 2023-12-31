import { createPortal } from "react-dom";
import { useContext } from "react";
import PropsContext from "../../context/PropsContext";

const Portal = ({ children }) => {
    const { tooltipContainerId } = useContext(PropsContext);

    const portal = document.getElementById(tooltipContainerId);

    if (!portal) return null;
    return createPortal(children, portal);
};

export default Portal;
