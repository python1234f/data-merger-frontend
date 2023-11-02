  import React, { useState, useEffect } from 'react';
  import './App.css';

  const API_URL = 'https://jsonplaceholder.typicode.com';

  const endpointsD1 = ["posts", "todos"];
  const endpointsD2 = ["users", "albums"];

  const App = () => {
    const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
    const [selectedEndpoint1, setSelectedEndpoint1] = useState("");
    const [selectedEndpoint2, setSelectedEndpoint2] = useState("");
    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [selectedColumn1, setSelectedColumn1] = useState("");
    const [selectedColumn2, setSelectedColumn2] = useState("");

  useEffect(() => {
    if (selectedEndpoint1) {
      setLoading1(true);
      fetch(API_URL + "/" + selectedEndpoint1 + "?_limit=100")
        .then(response => response.json())
        .then(data => {
          setData1(data);
          setLoading1(false);
        });
    }
  }, [selectedEndpoint1]);

  useEffect(() => {
    if (selectedEndpoint2) {
      setLoading2(true);
      fetch(API_URL + "/" + selectedEndpoint2 + "?_limit=100")
        .then(response => response.json())
        .then(data => {
          setData2(data);
          setLoading2(false);
        });
    }
  }, [selectedEndpoint2]);

    useEffect(() => {
      const handleResize = () => {
        setViewportWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxCellWidth = viewportWidth < 1400 ? '100px' : '150px';

  const hasMatchingRows = selectedColumn1 && selectedColumn2 &&
                          data1.some(item1 => data2.some(item2 => item1[selectedColumn1] === item2[selectedColumn2]));

  const handleMerge = () => {
    if (hasMatchingRows) {
      const shouldMerge = window.confirm(`Do you really want to merge on ${selectedColumn1} and ${selectedColumn2}?`);
      if (shouldMerge) {
        // Replace with your actual backend URL and logic
        fetch('https://dummy.backend.url/merge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url1: selectedEndpoint1,
            url2: selectedEndpoint2,
            column1: selectedColumn1,
            column2: selectedColumn2
          })
        })
        .then(response => response.json())
        .then(data => {
          // Handle backend response here
          console.log(data);
        });
      }
    }
  };

const mergeButtonMessage = () => {
  const numberOfTables = (data1.length ? 1 : 0) + (data2.length ? 1 : 0);
  const numberOfSelectedColumns = (selectedColumn1 ? 1 : 0) + (selectedColumn2 ? 1 : 0);

  if (numberOfSelectedColumns === 0) {
    return numberOfTables === 0 ? "Please select data" : "Please select first column";
  }

  if (numberOfSelectedColumns === 1) {
    return numberOfTables < 2 ? "Please select data" : "Please select second column";
  }

  // In case both columns are selected and data for both tables is available
  if (numberOfSelectedColumns === 2 && numberOfTables === 2) {
    return hasMatchingRows ?
      "Ready to Merge" :
      `No rows match between columns ${selectedColumn1} and ${selectedColumn2}`;
  }

  // Default case, though should not be reached
  return "Please select data";
};




    return (
      <div className="App">

        <div className="merge-section">
          <button
            style={{
              backgroundColor: !selectedColumn1 || !selectedColumn2 ? 'grey' : hasMatchingRows ? 'green' : 'yellow',
            }}
            disabled={!selectedColumn1 || !selectedColumn2 || (!hasMatchingRows && selectedColumn1 && selectedColumn2)}
            onClick={handleMerge}
          >
            Merge Tables
          </button>
          <div>{mergeButtonMessage()}</div>
        </div>

        <div className="data-section">
          <select value={selectedEndpoint1} onChange={(e) => setSelectedEndpoint1(e.target.value)}>
            <option value="">Select Endpoint</option>
            {endpointsD1.map(endpoint => (
              <option key={endpoint} value={endpoint}>{endpoint}</option>
            ))}
          </select>
          {loading1 ? <div>Loading...</div> :
            <Table
              data={data1}
              comparisonData={selectedColumn2 && data2.map(item => item[selectedColumn2])}
              maxCellWidth={maxCellWidth}
              setSelectedColumn={setSelectedColumn1}
              selectedColumn={selectedColumn1}
            />}
        </div>

        {/* Component 2 */}
        <div className="data-section">
          <select value={selectedEndpoint2} onChange={(e) => setSelectedEndpoint2(e.target.value)}>
            <option value="">Select Endpoint</option>
            {endpointsD2.map(endpoint => (
              <option key={endpoint} value={endpoint}>{endpoint}</option>
            ))}
          </select>
          {loading2 ? <div>Loading...</div> :
            <Table
              data={data2}
              comparisonData={selectedColumn1 && data1.map(item => item[selectedColumn1])}
              maxCellWidth={maxCellWidth}
              setSelectedColumn={setSelectedColumn2}
              selectedColumn={selectedColumn2}
            />}
        </div>
      </div>
    );
  }

  const Table = ({ data, comparisonData, maxCellWidth, setSelectedColumn, selectedColumn }) => {
    if (data.length === 0) return null;

    const columns = Object.keys(data[0]);

    return (
      <table>
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column}
                onClick={() => setSelectedColumn(column)}
                className={column === selectedColumn ? "selected-column" : ""}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              {columns.map(column => (
                <td
                  key={column}
                  style={{ maxWidth: maxCellWidth }}
                  className={column === selectedColumn ?
                             (comparisonData && comparisonData.includes(item[column]) ? 'matched-value' : 'unmatched-value')
                             : ''}
                >
                  <JSONTreeView data={item[column]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const JSONTreeView = ({ data, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(level === 0);

    if (data === null || typeof data !== 'object') {
      return <span>{data}</span>;
    }

    return (
      <div className="json-tree-view" style={{ marginLeft: `${level * 20}px` }}>
        <span onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? "[-]" : "[+]"}
        </span>
        {isExpanded && Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong>
            <JSONTreeView data={value} level={level + 1} />
          </div>
        ))}
      </div>
    );
  };

  export default App;
