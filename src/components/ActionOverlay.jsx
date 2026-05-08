import './VideoPlayer.css';

const ActionOverlay = ({ actionOverlay }) => {
    return (
        <>
            {actionOverlay && (
                <div className="action-overlay">
                    {actionOverlay === "play" && "▶"}
                    {actionOverlay === "pause" && "⏸"}
                    {actionOverlay === "backward" && "-5s"}
                    {actionOverlay === "forward" && "+5s"}
                    {actionOverlay === "restart" && "↻"}
                </div>
            )}
        </>
    )
};

export default ActionOverlay;