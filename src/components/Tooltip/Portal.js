import { useEffect } from "react";
import { createPortal } from "react-dom";
import { PORTAL_ID } from "../../exports/constants";

const Portal = ({ children }) => {
    const portal = document.getElementById(PORTAL_ID);
    const el = document.createElement("div");

    useEffect(() => {
        portal.appendChild(el);
        return () => portal.removeChild(el);
    }, [el, portal]);

    return createPortal(children, el);
}

export default Portal;
