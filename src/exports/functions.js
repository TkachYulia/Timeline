export const convertDatetimeToNumericMs = (datetime) => {
    return new Date(datetime).getTime();
}
