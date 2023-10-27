import React, {useState} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PostCreation: React.FC = () => {
    const [idea, setIdea] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [allowVoteVisibility, setAllowVoteVisibility] = useState(false);
    const [allowMultipleSelections, setAllowMultipleSelections] = useState(false);
    const [maxSelections, setMaxSelections] = useState(1);

    const handleSubmit = async () => {
        const response = await fetch('/api/createDiscussion', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                idea,
                startDate,
                endDate,
                allowVoteVisibility,
                allowMultipleSelections,
                maxSelections
            })
        });

        const data = await response.json();
        if (data.success) {
            // Handle success, maybe redirect or show a success message
        } else {
            // Handle error
        }
    };

    return (
        <div>
            <h1>Idea Whisper</h1>

            <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Your idea to discuss along with others"
                maxLength={200}
            />
            <div>{idea.length} / 200</div>

            <label>Voting Start Date</label>
            <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date as Date)}
            />

            <label>Voting End Date</label>
            <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date as Date)}
            />

            <div>
                <label>
                    <input type="checkbox" checked={allowVoteVisibility}
                           onChange={() => setAllowVoteVisibility(prev => !prev)}/>
                    Allow everyone to see the votes during voting
                </label>
            </div>

            <div>
                <label>
                    <input type="checkbox" checked={allowMultipleSelections}
                           onChange={() => setAllowMultipleSelections(prev => !prev)}/>
                    Allow multiple selections
                </label>
            </div>

            {allowMultipleSelections && (
                <div>
                    Maximum number of selections:
                    <input type="number" value={maxSelections}
                           onChange={(e) => setMaxSelections(Number(e.target.value))}/>
                </div>
            )}

            <button onClick={handleSubmit}>Create Discussion</button>
        </div>
    );

}

export default PostCreation;