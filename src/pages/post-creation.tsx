import React, {useState} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles_page from '../styles/PostCreation.module.css';
import buttonStyles from '../styles/Button.module.css';
import {useRouter} from "next/navigation";

const PostCreation: React.FC = () => {
    const [topic, setTopic] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [allowVoteVisibility, setAllowVoteVisibility] = useState(false);
    const [allowMultipleSelections, setAllowMultipleSelections] = useState(false);
    const [willBeVoted, setwillBeVoted] = useState(false);
    const [maxSelections, setMaxSelections] = useState(1);
    const router = useRouter();

    const handleSubmit = async () => {
        const response = await fetch('/api/createDiscussion', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                topic: topic,
                startDate,
                endDate,
                allowVoteVisibility,
                allowMultipleSelections,
                maxSelections
            })
        });

        const data = await response.json();
        if (data.success) {
            router.push('/discussion-page?link=' + data.adminLink);
        } else {
            alert(data.error);
        }
    };

    return (
        <div className={styles_page.container}>
            <h1>Idea Whisper</h1>

            <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Your discussion topic to discuss along with others"
                maxLength={200}
                rows={5}
            />
            <div>{topic.length} / 200</div>

            <div>
                <label>
                    <input type="checkbox" checked={willBeVoted}
                           onChange={() => setwillBeVoted(prev => !prev)}/>
                    Discussion will be voted
                </label>
            </div>

            {willBeVoted && (
                <div className={styles_page.datePickerContainer}>
                    <div className={styles_page.datePickerItem}>
                        <label>Voting Start Date</label>
                        <DatePicker
                            inline
                            dateFormat="dd/MM/yyyy"
                            showIcon
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            className={styles_page.datePicker}
                            selectsStart
                            minDate={new Date()}
                        />
                    </div>

                    <div className={styles_page.datePickerItem}>
                        <label>Voting End Date</label>
                        <DatePicker
                            inline
                            dateFormat="dd/MM/yyyy"
                            showIcon
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            className={styles_page.datePicker}
                            selectsEnd
                            minDate={new Date()}
                        />
                    </div>
                </div>
            )}

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
                    <input type="number" value={maxSelections} min={1}
                           onChange={(e) => setMaxSelections(Number(e.target.value))}/>
                </div>
            )}
            <br/>

            <button className={buttonStyles.button} onClick={handleSubmit}>Create Discussion</button>
        </div>
    );
}

export default PostCreation;