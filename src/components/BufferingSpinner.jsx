import './VideoPlayer.css';

const BufferingSpinner = ({ isBuffering }) => {
    return (
        <>
            {isBuffering && (
                <div className="spinner-overlay">
                <div className="spinner"></div>
                </div>
            )}
        </>
    )
};

export default BufferingSpinner;