export const convertDatetimeToNumericMs = (datetime) => {
    return new Date(datetime).getTime();
};

export const getTimeFormat = (dateTime) => {
    return dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const getDateTime = (dateTime) => {
    dateTime = new Date(dateTime);
    const day = String(dateTime.getDate()).padStart(2, "0");
    const month = String(dateTime.getMonth() + 1).padStart(2, "0");
    const year = dateTime.getFullYear();
    const hours = String(dateTime.getHours()).padStart(2, "0");
    const minutes = String(dateTime.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

export const createTimelineTimes = (startTime, finishTime) => {
    const result = [];
    let currentTime = startTime;

    while (currentTime <= finishTime) {
        result.push(new Date(currentTime));
        currentTime = new Date(currentTime).getTime() + 15 * 60 * 1000;
    }

    return result;
};
