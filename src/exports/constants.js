export const STEP_MINUTES = 15;

const _SHIFTED_TIME_ = new Date();
_SHIFTED_TIME_.setMinutes(new Date().getMinutes() + STEP_MINUTES);

export const TIME_STEP = _SHIFTED_TIME_.getTime() - new Date().getTime();
