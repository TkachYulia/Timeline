import "./resetStyles.css";
import "./App.css";
import TimelineFirst from "./components/TimelineFirst";
import TimelineSecond from "./components/TimelineSecond";

function App() {
    return (
        <div className="mainContainer">
            <TimelineFirst />
            <TimelineSecond />
        </div>
    );
}

export default App;
