
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
    title: string;
    icon?: LucideIcon;
    children: ReactNode;
}

export default function SectionCard({ title, icon: Icon, children }: SectionCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold text-dark dark:text-light mb-4 flex items-center">
                {Icon && <Icon className="mr-3 text-primary" />}
                {title}
            </h2>
            {children}
        </div>
    );
}

