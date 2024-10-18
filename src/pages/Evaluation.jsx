import React from 'react';
import './evaluation.css';

const Evaluation = () => {
    // Add your evaluation logic here



    return (
        <div>
            <h2>Evaluation Page</h2>
            <p className='evaluate-p'>Select members to evaluate</p>

            <div className='evaluate-div'>
                <table className='evaluation-table'>
                    <thead>
                        <tr>
                            <th>Members</th>
                            <th>Evaluate</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>John Doe</td>
                            <td>
                                <label>
                                    <input type="checkbox" className="checkmark" />
                                    <span className="checkmark"></span>
                                </label>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="dimensions-container">
                    <div className="scroll-bar">
                        <div className="dimension-box">Conceptual Contribution</div>
                        <div className="dimension-box">Practical Contribution</div>
                        <div className="dimension-box">Work Ethic</div>
                        <div className="dimension-box">Team Collaboration</div>
                        <div className="dimension-box">Leadership</div>
                    </div>
                </div>

            


                <div className="rating-container">
                    <div className="rating-box">
                        <span className="rating-label">John</span>

                        {/* Rating selection with radio buttons */}
                        <input type="radio" id="rate1" name="rating" value="1" />
                        <label htmlFor="rate1">1</label>

                        <input type="radio" id="rate2" name="rating" value="2" />
                        <label htmlFor="rate2">2</label>

                        <input type="radio" id="rate3" name="rating" value="3" />
                        <label htmlFor="rate3">3</label>

                        <input type="radio" id="rate4" name="rating" value="4" />
                        <label htmlFor="rate4">4</label>

                        <input type="radio" id="rate5" name="rating" value="5" />
                        <label htmlFor="rate5">5</label>
                    </div>

                    {/* Comment Box */}
                    <textarea className="comment-box" rows="4" placeholder="Add a comment (optional)"></textarea>
                </div>

                 
                <button className="submit-button">Submit</button>














            </div>
















        </div>
    );
};

export default Evaluation;
