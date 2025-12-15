
interface JobDescriptionInputProps {
    value: string;
    onChange: (value: string) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

export default function JobDescriptionInput({
    value,
    onChange,
    onAnalyze,
    isAnalyzing,
}: JobDescriptionInputProps) {
    return (
        <div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-40 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors resize-y"
            />
            <button
                onClick={onAnalyze}
                disabled={isAnalyzing || !value.trim()}
                className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/[0.9] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
        </div>
    );
}

