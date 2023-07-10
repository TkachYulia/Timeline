import "./resetStyles.css";
import "./App.css";
import TimelineSecond from "./components/TimelineSecond";
import { useState } from "react";

function App() {
    const [timelineStartTime] = useState(new Date().setHours(7, 0, 0, 0));
    const [timelineFinishTime] = useState(new Date().setHours(35, 0, 0, 0));

    return (
        <div className="mainContainer">
            <TimelineSecond startTime={timelineStartTime} finishTime={timelineFinishTime} />
        </div>
    );
}

export default App;
