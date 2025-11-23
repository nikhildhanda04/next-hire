// Skill category component
import SkillBadge from '../common/SkillBadge';

interface SkillCategoryProps {
    title: string;
    skills?: string[];
}

export default function SkillCategory({ title, skills }: SkillCategoryProps) {
    if (!skills || skills.length === 0) return null;

    return (
        <div>
            <h4 className="font-semibold text-dark dark:text-light mb-2">{title}</h4>
            <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                    <SkillBadge key={index} skill={skill} />
                ))}
            </div>
        </div>
    );
}

