import { createPortal } from "react-dom";
import { TOOLTIP_PORTAL_ID } from "../../exports/constants";

const Portal = ({ closeTooltip, children }) => {
    const portal = document.getElementById(TOOLTIP_PORTAL_ID);

    return createPortal(children, portal);
};

export default Portal;
