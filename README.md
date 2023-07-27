Main function's name: deployTimeline

Props:
    + containerId: string;
    + startTime: timestamp;
    + finishTime: timestamp;
    - creatable: boolean (default false);
    - byBreakPoint: boolean (default false);
    - displayStep: number (default 10);
    - createStep: number (default 60);
    + columns: Array({
        title: string,
        param: string
    });
    - data: Array({
        (data parameters...),
        timeline: Array({
            workName: string,
            startTime: timestamp,
            finishTime: timestamp,
            color: string (RGB or HEX),
            modalUrl: string
        })
    });
