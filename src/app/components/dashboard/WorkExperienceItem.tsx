
import type { WorkExperience } from '@/app/store/resumeStore';

interface WorkExperienceItemProps {
    experience: WorkExperience;
}

export default function WorkExperienceItem({ experience }: WorkExperienceItemProps) {
    return (
        <div>
            <h3 className="text-lg font-semibold">{experience.job_title}</h3>
            <p className="text-md text-stone-600 dark:text-stone-300">
                {experience.company} {experience.location && `| ${experience.location}`}
            </p>
            <p className="text-sm text-stone-500">
                {experience.start_date} - {experience.end_date || 'Present'}
            </p>
            {experience.description && experience.description.length > 0 && (
                <ul className="list-disc list-inside mt-2 text-stone-500 space-y-1">
                    {experience.description.map((desc, i) => (
                        <li key={i}>{desc}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

