
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import SectionCard from '../common/SectionCard';

interface PersonalDetailsProps {
    fullName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    location?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    portfolioUrl?: string | null;
}

function ensureAbsoluteUrl(url: string | null | undefined): string {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`;
}

export default function PersonalDetails({
    fullName,
    email,
    phoneNumber,
    location,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
}: PersonalDetailsProps) {
    return (
        <SectionCard title="Personal Details" icon={User}>
            <div className="space-y-3 text-stone-600 dark:text-stone-300">
                {fullName && (
                    <p className="flex items-center">
                        <User className="mr-2 h-4 w-4 flex-shrink-0" />
                        {fullName}
                    </p>
                )}
                {email && (
                    <p className="flex items-center break-all">
                        <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                        {email}
                    </p>
                )}
                {phoneNumber && (
                    <p className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                        {phoneNumber}
                    </p>
                )}
                {location && (
                    <p className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                        {location}
                    </p>
                )}
                {linkedinUrl && (
                    <a
                        href={ensureAbsoluteUrl(linkedinUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-primary transition-colors break-all"
                    >
                        <Linkedin className="mr-2 h-4 w-4 flex-shrink-0" />
                        {linkedinUrl}
                    </a>
                )}
                {githubUrl && (
                    <a
                        href={ensureAbsoluteUrl(githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-primary transition-colors break-all"
                    >
                        <Github className="mr-2 h-4 w-4 flex-shrink-0" />
                        {githubUrl}
                    </a>
                )}
                {portfolioUrl && (
                    <a
                        href={ensureAbsoluteUrl(portfolioUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-primary transition-colors break-all"
                    >
                        <Globe className="mr-2 h-4 w-4 flex-shrink-0" />
                        {portfolioUrl}
                    </a>
                )}
            </div>
        </SectionCard>
    );
}

