// Project item component
import { ExternalLink } from 'lucide-react';
import type { Project } from '@/app/store/resumeStore';
import SkillBadge from '../common/SkillBadge';

interface ProjectItemProps {
    project: Project;
}

function ensureAbsoluteUrl(url: string | null | undefined): string {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`;
}

export default function ProjectItem({ project }: ProjectItemProps) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                {project.name && <h3 className="text-lg font-semibold">{project.name}</h3>}
                {project.url && (
                    <a
                        href={ensureAbsoluteUrl(project.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center text-sm font-medium"
                    >
                        View Project <ExternalLink className="ml-1.5 h-4 w-4" />
                    </a>
                )}
            </div>
            {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="mt-3 flex items-center flex-wrap gap-y-2">
                    <h4 className="text-sm font-semibold text-dark dark:text-light mr-2">Tech Stack:</h4>
                    <div className="flex flex-wrap gap-2">
                        {project.tech_stack.map((tech, i) => (
                            <SkillBadge key={i} skill={tech} />
                        ))}
                    </div>
                </div>
            )}
            {project.description && project.description.length > 0 && (
                <ul className="list-disc list-inside text-stone-500 space-y-1">
                    {project.description.map((desc, i) => (
                        <li key={i}>{desc}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

