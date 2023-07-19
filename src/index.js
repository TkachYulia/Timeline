import React from "react";
import ReactDOM from "react-dom/client";
import Timeline from "./components";

const colors = [
    { background: "#E57373", hoverBackground: "#D95555" }, // Light red tones
    { background: "#7986CB", hoverBackground: "#5B6BC0" }, // Light blue tones
    { background: "#81C784", hoverBackground: "#5CB660" }, // Light green tones
    { background: "#FFD54F", hoverBackground: "#F0C22F" }, // Light yellow tones
];

function generateColors() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

const createWork = (workName, startTime, finishTime) => {
    const currentTime = new Date();
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);

    const computedStartTime = new Date(currentTime);
    computedStartTime.setHours(startTime.split(":")[0]);
    computedStartTime.setMinutes(startTime.split(":")[1]);

    const computedFinishTime = new Date(currentTime);
    computedFinishTime.setHours(finishTime.split(":")[0]);
    computedFinishTime.setMinutes(finishTime.split(":")[1]);

    return {
        workName,
        startTime: computedStartTime,
        finishTime: computedFinishTime,
        color: generateColors(),
    };
};

const deployTimeline = (initProps = {}) => {
    if (!initProps.containerId || !initProps.columns || !initProps.startTime || !initProps.finishTime) return;

    const container = document.getElementById(initProps.containerId);
    if (!container) return;

    const root = ReactDOM.createRoot(container);

    root.render(<Timeline initProps={{ ...initProps, creatable: !!initProps.creatable }} />);
};

deployTimeline({
    containerId: "root",
    startTime: new Date().setHours(7, 0, 0, 0),
    finishTime: new Date().setHours(19, 0, 0, 0),
    creatable: true,
    columns: [
        {
            title: "Транспорт",
            param: "transport.transportName",
        },
        {
            title: "Инвентарный номер",
            param: "inventaryNumber",
        },
        {
            title: "Код транспорта",
            param: "transportCode",
        },
    ],
    data: [
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "7036320",
            transportCode: "100500",
            timeline: [
                createWork("Выполнить земляные работы", "8:03", "8:06"),
                createWork("Перевезти грунт на склад", "09:00", "12:00"),
                createWork("Обслуживание", "09:00", "10:00"),
                createWork("Подготовить к работе", "11:00", "18:00"),
                createWork("Ремонт", "12:00", "18:00"),
                createWork("Завершить выемку траншеи", "11:00", "18:00"),
            ],
        },
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "7036320",
            transportCode: "100500",
            timeline: [
                createWork("Проверить систему гидравлики", "8:03", "8:08"),
                createWork("Управление движением грузовиков на территории", "9:00", "18:00"),
                createWork("Заправить топливом самосвалы", "08:30", "09:30"),
            ],
        },
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "7036320",
            transportCode: "100500",
            timeline: [
                createWork("Поднять и установить новый ковш", "8:03", "8:16"),
                createWork("Перевезти материалы на строительную площадку", "11:00", "12:00"),
            ],
        },
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "7036320",
            transportCode: "100500",
            timeline: [
                createWork("Подготовить экскаватор к утреннему сеансу работы", "8:03", "8:21"),
                createWork("Загрузить самосвалы грунтом", "11:00", "12:00"),
            ],
        },
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "7036320",
            transportCode: "100500",
            timeline: [
                createWork("Заправить топливом экскаваторы и самосвалы", "8:03", "8:23"),
                createWork("Передвинуть самосвалы на площадку для погрузки", "11:00", "12:00"),
            ],
        },
        {
            transport: {
                transportName: "КАМАЗ 53215 № 2215",
            },
            inventaryNumber: "6854998",
            transportCode: "155044",
            timeline: [
                createWork("Удалить и утилизировать отходы с площадки", "7:00", "7:15"),
                createWork("Разгрузить самосвалы на складе", "8:15", "9:15"),
                createWork("Переместить экскаватор на новую строительную площадку", "9:30", "11:15"),
            ],
        },
    ].map((item, index) => ({
        ...item,
        id: index,
        timeline: item.timeline.map((timelineItem) => ({
            ...timelineItem,
            modalUrl: `/some-js-url?withParams=${timelineItem.workName}&index=${index}`,
        })),
    })),
});

export { deployTimeline };
