'use client';

import type { ResumeData } from '../../store/resumeStore';
import { Briefcase, GraduationCap, Code, Star, Award, Book, Languages } from 'lucide-react';
import PersonalDetails from './PersonalDetails';
import SkillCategory from './SkillCategory';
import SectionCard from '../common/SectionCard';
import WorkExperienceItem from './WorkExperienceItem';
import ProjectItem from './ProjectItem';

interface ResumeDetailsTabProps {
    resumeData: ResumeData | null;
}

const ResumeDetailsTab: React.FC<ResumeDetailsTabProps> = ({ resumeData }) => {
    if (!resumeData) {
        return <p>No resume data available.</p>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            {/* Left Sidebar (Sticky) */}
            <aside className="lg:col-span-1 lg:sticky lg:top-8 self-start space-y-8">
                <PersonalDetails
                    fullName={resumeData.full_name}
                    email={resumeData.email}
                    phoneNumber={resumeData.phone_number}
                    location={resumeData.location}
                    linkedinUrl={resumeData.linkedin_url}
                    githubUrl={resumeData.github_url}
                    portfolioUrl={resumeData.portfolio_url}
                />

                {resumeData.categorized_skills && (
                    <SectionCard title="Skills">
                        <div className="space-y-4">
                            <SkillCategory
                                title="Programming Languages"
                                skills={resumeData.categorized_skills.programming_languages}
                            />
                            <SkillCategory
                                title="Frameworks & Libraries"
                                skills={resumeData.categorized_skills.frameworks_libraries}
                            />
                            <SkillCategory
                                title="Databases"
                                skills={resumeData.categorized_skills.databases}
                            />
                            <SkillCategory
                                title="Cloud & DevOps"
                                skills={resumeData.categorized_skills.cloud_technologies}
                            />
                            <SkillCategory
                                title="Tools & Platforms"
                                skills={resumeData.categorized_skills.tools_platforms}
                            />
                        </div>
                    </SectionCard>
                )}

                {!resumeData.categorized_skills && resumeData.uncategorized_skills && resumeData.uncategorized_skills.length > 0 && (
                    <SectionCard title="Skills">
                        <div className="flex flex-wrap gap-2">
                            {resumeData.uncategorized_skills.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-stone-700 dark:text-stone-300 rounded-full text-sm font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </SectionCard>
                )}
            </aside>

            {/* Main Content (Scrollable) */}
            <main className="lg:col-span-2 space-y-8">
                {resumeData.summary && (
                    <SectionCard title="Summary">
                        <p className="text-stone-500">{resumeData.summary}</p>
                    </SectionCard>
                )}

                {resumeData.work_experience && resumeData.work_experience.length > 0 && (
                    <SectionCard title="Work Experience" icon={Briefcase}>
                        <div className="space-y-6">
                            {resumeData.work_experience.map((job, index) =>
                                job ? <WorkExperienceItem key={index} experience={job} /> : null
                            )}
                        </div>
                    </SectionCard>
                )}

                {resumeData.projects && resumeData.projects.length > 0 && (
                    <SectionCard title="Projects" icon={Code}>
                        <div className="space-y-6">
                            {resumeData.projects.map((project, index) =>
                                project ? <ProjectItem key={index} project={project} /> : null
                            )}
                        </div>
                    </SectionCard>
                )}

                {resumeData.education && resumeData.education.length > 0 && (
                    <SectionCard title="Education" icon={GraduationCap}>
                        <div className="space-y-4">
                            {resumeData.education.map((edu, index) =>
                                edu ? (
                                    <div key={index}>
                                        <h3 className="text-lg font-semibold">{edu.degree}</h3>
                                        <p className="text-md text-stone-600 dark:text-stone-300">
                                            {edu.institution} {edu.location && `| ${edu.location}`}
                                        </p>
                                        <p className="text-sm text-stone-500">{edu.graduation_date}</p>
                                    </div>
                                ) : null
                            )}
                        </div>
                    </SectionCard>
                )}

                {resumeData.certifications && resumeData.certifications.length > 0 && (
                    <SectionCard title="Certifications" icon={Award}>
                        <div className="space-y-4">
                            {resumeData.certifications.map((cert, index) =>
                                cert ? (
                                    <div key={index}>
                                        <h3 className="text-lg font-semibold">{cert.name}</h3>
                                        <p className="text-md text-stone-600 dark:text-stone-300">
                                            {cert.organization}
                                        </p>
                                        <p className="text-sm text-stone-500">{cert.date}</p>
                                    </div>
                                ) : null
                            )}
                        </div>
                    </SectionCard>
                )}

                {resumeData.publications && resumeData.publications.length > 0 && (
                    <SectionCard title="Publications" icon={Book}>
                        <ul className="list-disc list-inside text-stone-500 space-y-2">
                            {resumeData.publications.map((pub, index) => (
                                <li key={index}>{pub}</li>
                            ))}
                        </ul>
                    </SectionCard>
                )}

                {resumeData.achievements && resumeData.achievements.length > 0 && (
                    <SectionCard title="Achievements" icon={Star}>
                        <ul className="list-disc list-inside text-stone-500 space-y-2">
                            {resumeData.achievements.map((ach, index) => (
                                <li key={index}>{ach}</li>
                            ))}
                        </ul>
                    </SectionCard>
                )}

                {resumeData.languages && resumeData.languages.length > 0 && (
                    <SectionCard title="Languages" icon={Languages}>
                        <div className="space-y-2">
                            {resumeData.languages.map((lang, index) =>
                                lang ? (
                                    <p key={index} className="text-stone-600 dark:text-stone-300">
                                        <span className="font-semibold">{lang.language}:</span>{' '}
                                        {lang.proficiency}
                                    </p>
                                ) : null
                            )}
                        </div>
                    </SectionCard>
                )}
            </main>
        </div>
    );
};

export default ResumeDetailsTab;
