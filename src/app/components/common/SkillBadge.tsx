// Reusable skill badge component
interface SkillBadgeProps {
    skill: string;
}

export default function SkillBadge({ skill }: SkillBadgeProps) {
    return (
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">
            {skill}
        </span>
    );
}

