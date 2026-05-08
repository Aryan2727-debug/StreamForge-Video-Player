import './VideoPlayer.css';

const QualitySelector = ({ quality, selectedLevel, handleQualityChange, levels }) => {
    return (
        <>
            {/* Quality Display */}
            <span className="quality">{quality}</span>

            {/* Quality Selector */}
            <select
                className="quality-selector"
                value={selectedLevel}
                onChange={handleQualityChange}
            >
                <option value={-1}>Auto</option>
                {levels.map(function (level, index) {
                    return (
                    <option key={index} value={index}>
                        {level.height}p
                    </option>
                    );
                })}
            </select>
        </>
    )
};

export default QualitySelector;