import React from 'react';
import './result.css'
const Result = () => {
    



    return (
        <div>
            <div className="headerspacing">
                <h1>Evaluation Results </h1>
            </div>
            <div className="drop-down">
            <label htmlFor="team-select">Select Team: </label>
            <select id="team-select">
                <option value="team1">Team 1</option>
                <option value="team2">Team 2</option>
                <option value="team3">Team 3</option>
                <option value="team4">Team 4</option>
            </select>
            </div>
            <div className="table-container">

                
                <table className="result-table">
                    <thead>
                        <tr>
                            <th>Members</th>
                            <th>Conceptual Contribution</th>
                            <th>Practical Contribution</th>
                            <th>Work Ethics</th>
                            <th>Team Collaboration</th>
                            <th>Leadership</th>
                            <th>Average</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Student 1</td>
                            <td>3</td>
                            <td>4</td>
                            <td>2</td>
                            <td>5</td>
                            <td>1</td>
                            <td>5</td>   
                        </tr>
                        <tr>
                            <td>Student 2</td>
                            <td>4</td>
                            <td>3</td>
                            <td>1</td>
                            <td>5</td>
                            <td>5</td>
                            <td>5</td>
                        </tr>
                        <tr>
                            <td>Student 3</td>
                            <td>5</td>
                            <td>3</td>
                            <td>2</td>
                            <td>4</td>
                            <td>5</td>
                            <td>5</td>   
                        </tr>
                        <tr>
                            <td>Student 4</td>
                            <td>5</td>
                            <td>3</td>
                            <td>2</td>
                            <td>4</td>
                            <td>5</td>
                            <td>5</td>   
                        </tr>
                    </tbody>
                </table>    
            </div>

        </div>
    );
};

export default Result;