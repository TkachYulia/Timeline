import "./resetStyles.css";
import "./App.css";
import TimelineFirst from "./components/TimelineFirst";
import TimelineSecond from "./components/TimelineSecond";
import { useState } from "react";

function App() {
    const [timelineStartTime] = useState(new Date().setHours(7, 0, 0, 0));
    const [timelineFinishTime] = useState(new Date().setHours(19, 0, 0, 0));

    return (
        <div className="mainContainer">
            {/* <TimelineFirst /> */}
            <TimelineSecond startTime={timelineStartTime} finishTime={timelineFinishTime} />
        </div>
    );
}

export default App;
