export const STEP_MINUTES = 10;

const _SHIFTED_TIME_ = new Date();
_SHIFTED_TIME_.setMinutes(new Date().getMinutes() + STEP_MINUTES);

export const TIME_STEP = _SHIFTED_TIME_.getTime() - new Date().getTime();

export const START_ID = "START";
export const FINISH_ID = "FINISH";

export const PORTAL_ID = "$TOOLTIP_PORTAL_ID$";
