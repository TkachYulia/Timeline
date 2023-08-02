# API

### Main usage
```
deployTimeline({
    ...
})
```

### Configuration
| Parameter            | Type      | Required | Description                                      | Default Value |
|----------------------|-----------|----------|--------------------------------------------------|---------------|
| `containerId`        | `string`  | Yes      | ID of the deploy container                       | -             |
| `startTime`          | `number`  | Yes      | Start time of the timeline, in milliseconds      | -             |
| `finishTime`         | `number`  | Yes      | Finish time of the timeline, in milliseconds     | -             |
| `columns`            | `array`   | Yes      | Array of [column objects](#column-api)           | -             |
| `data`               | `array`   | Yes      | Array of [data objects](#data-api)               | -             |
| `timelineTitle`      | `string`  | No       | Title of the timeline section                    | `""`          |
| `numberedColumnTitle`| `string`  | No       | Title of the numbered column                     | `"п/п"`       |
| `creatable`          | `boolean` | No       | Switcher for enabling create functionality       | `false`       |
| `byBreakPoint`       | `boolean` | No       | Switcher for creating only between breakpoints. This won't work if `creatable` is `false` | `false` |
| `createStep`         | `number`  | No       | The size of breakpoints, measured in minutes     | `60`          |
| `displayStep`        | `number`  | No       | The size of small divisions between breakpoints, measured in minutes | `10` |

### Column API
| Parameter        | Type      | Description                                       |
|------------------|-----------|---------------------------------------------------|
| `title`          | `string`  | Displayable title of the column                   |
| `param`          | `string`  | Name of the parameter                             |

### Data API
The Data object has its own initial data parameters, in addition to the following:
| Parameter        | Type      | Description                                       |
|------------------|-----------|---------------------------------------------------|
| `timeline`       | `array`   | Array of [timeline objects](#timeline-item-api)        |

### Timeline Item API
| Parameter        | Type      | Description                                       |
|------------------|-----------|---------------------------------------------------|
| `workName`       | `string`  | Name of the timeline item                         |
| `startTime`      | `number`  | Start time of the timeline item, in milliseconds  |
| `finishTime`     | `number`  | Finish time of the timeline item, in milliseconds |
| `color`          | `string`  | Background color of the timeline item. Accepts HEX format only, e.g., `#FF9595` or `#ACB` |
| `modalUrl`       | `string`  | Command link on click for the timeline item       |
