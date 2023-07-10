import "./resetStyles.css";
import "./App.css";
import Timeline from "./components";
import { useState } from "react";

function App() {
    const [timelineStartTime] = useState(new Date().setHours(7, 0, 0, 0));
    const [timelineFinishTime] = useState(new Date().setHours(35, 0, 0, 0));

    return (
        <div className="mainContainer">
            <Timeline startTime={timelineStartTime} finishTime={timelineFinishTime} />
        </div>
    );
}

export default App;
