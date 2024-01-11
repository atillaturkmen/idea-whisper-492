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
    const [willBeVoted, setWillBeVoted] = useState(false);
    const [enableLikes, setEnableLikes] = useState(false);
    const [maxSelections, setMaxSelections] = useState(1);
    const [groupNames, setGroupNames] = useState<string[]>([]);
    const [isEmailCollector, setIsEmailCollector] = useState<boolean[]>([]);
    const [emailListInputs, setEmailListInputs] = useState<string[]>([]);

    const router = useRouter();

    const handleSubmit = async () => {
        const groups = groupNames.filter(element => element.trim() !== "").
        map((groupName, index) => {
            return {
                name: groupName,
                isEmailCollector: isEmailCollector[index],
                emailList: emailListInputs[index]?.split(',').
                filter(email => email.trim() !== "").
                map(email => email.trim()),
            };
        });
        const response = await fetch('/api/createDiscussion', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                topic,
                startDate,
                endDate,
                allowVoteVisibility,
                allowMultipleSelections,
                maxSelections,
                enableLikes,
                groups,
            })
        });

        const data = await response.json();
        if (data.success) {
            router.push('/discussion-page?link=' + data.adminLink);
        } else {
            alert(data.error);
        }
    };

    const handleCollectorTypeChange = (index: number) => {
        const newIsEmailCollector = [...isEmailCollector];
        newIsEmailCollector[index] = !newIsEmailCollector[index];
        setIsEmailCollector(newIsEmailCollector);

        if (!newIsEmailCollector[index]) {
            // Clear the email list input when switching away from email collector
            const newEmailListInputs = [...emailListInputs];
            newEmailListInputs[index] = '';
            setEmailListInputs(newEmailListInputs);
        }
    };

    const handleEmailListInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newEmailListInputs = [...emailListInputs];
        newEmailListInputs[index] = e.target.value;
        setEmailListInputs(newEmailListInputs);
    };

    const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newGroupNames = [...groupNames];
        newGroupNames[index] = e.target.value;
        setGroupNames(newGroupNames);
    };

    const addGroupName = () => {
        setGroupNames([...groupNames, '']);
        setEmailListInputs([...emailListInputs, '']); // Add an empty string for the new group
        setIsEmailCollector([...isEmailCollector, false]); // Add false as default for new group
    };

    const removeGroupName = (index: number) => {
        const newGroupNames = [...groupNames];
        newGroupNames.splice(index, 1);
        setGroupNames(newGroupNames);

        const newEmailListInputs = [...emailListInputs];
        newEmailListInputs.splice(index, 1); // Remove the email list input for the removed group
        setEmailListInputs(newEmailListInputs);

        const newIsEmailCollector = [...isEmailCollector];
        newIsEmailCollector.splice(index, 1); // Remove the corresponding email collector state
        setIsEmailCollector(newIsEmailCollector);
    };

    const timeZonePart = new Intl.DateTimeFormat('en-US', {timeZoneName: 'short', hour12: false})
        .formatToParts(new Date())
        .find(part => part.type === 'timeZoneName');

    const timeZoneName = timeZonePart ? timeZonePart.value : 'Unknown Time Zone';

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
                           onChange={() => setWillBeVoted(prev => !prev)}/>
                    Discussion will be voted
                </label>
            </div>

            {willBeVoted && (
                <div className={styles_page.datePickerContainer}>
                    <div className={styles_page.datePickerItem}>
                        <label>Voting Start Date ({timeZoneName})
                        </label>
                        <DatePicker
                            inline
                            dateFormat="dd/MM/yyyy"
                            showIcon
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            className={styles_page.datePicker}
                            selectsStart
                            minDate={new Date()}
                            showTimeSelect={true}
                            timeIntervals={15}
                            timeFormat="HH:mm"
                        />
                    </div>

                    <div className={styles_page.datePickerItem}>
                        <label>Voting End Date ({timeZoneName})</label>
                        <DatePicker
                            inline
                            dateFormat="dd/MM/yyyy"
                            showIcon
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            className={styles_page.datePicker}
                            selectsEnd
                            minDate={new Date()}
                            showTimeSelect={true}
                            timeIntervals={15}
                            timeFormat="HH:mm"
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
                    <input type="checkbox" checked={enableLikes}
                           onChange={() => setEnableLikes(prev => !prev)}/>
                    Enable likes on pros and cons
                </label>
            </div>

            {willBeVoted && <div>
                <label>
                    <input type="checkbox" checked={allowMultipleSelections}
                           onChange={() => setAllowMultipleSelections(prev => !prev)}/>
                    Allow multiple selections
                </label>
            </div>}

            {allowMultipleSelections && (
                <div>
                    Maximum number of selections:
                    <input type="number" value={maxSelections} min={1}
                           onChange={(e) => setMaxSelections(Number(e.target.value))}/>
                </div>
            )}

            {willBeVoted && <div>
                {groupNames.map((groupName, index) => (
                    <div key={index} className={styles_page.groupCard}>
                        <div className={styles_page.groupHeader}>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => handleGroupNameChange(e, index)}
                                className={styles_page.groupNameInput}
                                placeholder="Focus Group Name"
                            />
                            <button
                                className={`${buttonStyles.smallButton} ${styles_page.removeGroupButton}`}
                                onClick={() => removeGroupName(index)}
                            >
                                Remove
                            </button>
                        </div>
                        <div className={styles_page.groupBody}>
                            <label className={styles_page.emailCollectorLabel}>
                                <input
                                    type="radio"
                                    checked={!isEmailCollector[index]}
                                    onChange={() => handleCollectorTypeChange(index)}
                                />
                                Link Collector
                                <input
                                    type="radio"
                                    checked={isEmailCollector[index] || false}
                                    onChange={() => handleCollectorTypeChange(index)}
                                    style={{marginLeft: '10px'}}
                                />
                                Email Collector
                            </label>
                            {isEmailCollector[index] && (
                                <input
                                    type="text"
                                    value={emailListInputs[index] || ''}
                                    onChange={(e) => handleEmailListInputChange(e, index)}
                                    className={styles_page.emailListInput}
                                    placeholder="Enter comma-separated emails"
                                />
                            )}
                        </div>
                    </div>
                ))}

                <button className={buttonStyles.smallButton} onClick={addGroupName}>Add-Vote-Collector</button>
            </div>}
            <br/>

            <button className={buttonStyles.button} onClick={handleSubmit}>Create Discussion</button>
        </div>
    );
}

export default PostCreation;