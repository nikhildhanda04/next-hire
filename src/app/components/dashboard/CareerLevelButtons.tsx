
interface CareerLevelButtonsProps {
    onSelect: (level: string) => void;
    isAnalyzing: boolean;
}

export default function CareerLevelButtons({ onSelect, isAnalyzing }: CareerLevelButtonsProps) {
    const levels = ['Entry Level', 'Mid Level', 'Senior Level'];

    return (
        <div className="flex flex-wrap gap-3">
            {levels.map((level) => (
                <button
                    key={level}
                    onClick={() => onSelect(level)}
                    disabled={isAnalyzing}
                    className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-dark dark:text-light font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {level}
                </button>
            ))}
        </div>
    );
}

