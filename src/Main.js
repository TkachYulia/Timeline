import {useEffect, useState} from "react";
import { Button, Divider, Segmented, Tooltip } from 'antd';

function Main () {
    const [isDragging, setIsDragging] = useState(false);
    const [timeList, setTimeList] = useState([])
    const [eventsList, setEventsList] = useState([])

    const [intervals, setIntervals] = useState([])
    const minutes = ['00', '15', '30', '45']

    useEffect(() => {
        console.log('useeffect')
        {(intervals.length === 0) &&
            setTimeList(Array(24).fill(1).map((el, i) => {
                for (let l = 0; l < 4; l++) {
                    intervals.push(`${i}:${minutes[l]}`)
                }
                return `${i}:00`
            }))
        }
    }, [])

    const oneHourBlock = (index) => {
        const time = (index * 4);
        return (
            <div style={{display: "flex", flexDirection: "row", flexWrap: "nowrap"}}>
                <Tooltip placement="top" title={intervals[time]}>
                    <div key={`${time}-1`} style={{width: '100%', height: 100, borderColor: 'gray', borderLeft: '1px solid gray', borderBottom: '1px solid gray',boxSizing: "border-box"}}
                         onMouseDown={() => handleKeyDown(time)}
                         onMouseUp={() => handleKeyUp(time)}
                    >
                    </div>
                </Tooltip>
                <Tooltip placement="top" title={intervals[time+1]}>
                    <div key={`${time}-2`} style={{width: '100%', height: 100, borderColor: 'gray', borderBottom: '1px solid gray', borderLeft: '0.5px solid lightGray',boxSizing: "border-box"}}
                         onMouseDown={() => handleKeyDown(time+1)}
                         onMouseUp={() => handleKeyUp(time+1)}
                    >
                    </div>
                </Tooltip>
                <Tooltip placement="top" title={intervals[time+2]}>
                    <div key={`${time}-3`} style={{width: '100%', height: 100, borderColor: 'gray', borderBottom: '1px solid gray', borderLeft: '0.5px solid lightGray',boxSizing: "border-box"}}
                         onMouseDown={() => handleKeyDown(time+2)}
                         onMouseUp={() => handleKeyUp(time+2)}
                    >
                    </div>
                </Tooltip>
                <Tooltip placement="top" title={intervals[time+3]}>
                    <div key={`${time}-4`} style={{width: '100%', height: 100, borderColor: 'gray', borderRight: '1px solid gray', borderBottom: '1px solid gray', borderLeft: '0.5px solid lightGray',boxSizing: "border-box"}}
                         onMouseDown={() => handleKeyDown(time+3)}
                         onMouseUp={() => handleKeyUp(time+3)}
                    >
                    </div>
                </Tooltip>
            </div>
        )
    }

    const [startTime, setStartTime] = useState('')
    const handleKeyDown = (time) => {
        console.log(`Start: ${time}`);
        setIsDragging(true);
        const newList = eventsList;
        newList.push({id: `1-${time}`, startTimeIndex: time, xPosition: 15 + time * 0.6 + time * 35,  finishTimeIndex: time, width: 35})
        setStartTime(`1-${time}`)
        setEventsList(newList)
    }

    const handleKeyUp = (time) => {
        if (!isDragging) return;
        console.log(`End: ${time}`);
        setIsDragging(false);
        const newList = eventsList;

        const index = newList.findIndex((item) => item.id === startTime)
        newList[index] = {...newList[index], finishTimeIndex: time, width: ((time) - Number(startTime.slice(2)))*35}

        setEventsList(newList);
        setStartTime('');
    }
    console.log(eventsList)
    return (
        <div
            style={{boxSizing: "border-box", display: "flex", flexDirection: "row", flexWrap: "nowrap", width: "100%", height: '400px', backgroundColor: "rgb(250, 250, 255)", padding: 15, overflow: "auto", position: 'relative'}}
            id="mouse-pos"
        >
            {timeList.map((el, i) =>
                <div>
                    <div key={i} style={{width: 140,height: 30, borderColor: 'gray', border: '1px solid gray'}}>{el}</div>
                    {oneHourBlock(i)}
                </div>
            )}

            {eventsList.map((item) => item?.finishTimeIndex &&
                <div style={{width: item.width, height: 50, backgroundColor: 'lightpink', zIndex: 2, top: 80, left: item.xPosition, position: 'absolute', boxSizing: "border-box"}}>
                    {(item.startTimeIndex !== item.finishTimeIndex) ?
                        <>
                            {intervals[item.startTimeIndex]}-{intervals[item.finishTimeIndex]}
                        </>
                         :
                        <>
                            {intervals[item.startTimeIndex]}-{intervals[item.startTimeIndex + 1]}
                        </>
                    }
                </div>
            )}
        </div>
    );

}

export default Main;