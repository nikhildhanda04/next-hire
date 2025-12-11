import { FileText, Zap, MessageSquare, Shield } from "lucide-react";

export default function Features() {
    const features = [
        {
            icon: <FileText size={32} className="text-blue-500" />,
            title: "Smart Parsing",
            description: "Instant resume parsing and extraction of skills, jobs, and education. Just upload your PDF or docx."
        },
        {
            icon: <Zap size={32} className="text-yellow-500" />,
            title: "One-Click Autofill",
            description: "No more copy-pasting. Our Chrome extension autofills complex job applications in seconds."
        },
        {
            icon: <MessageSquare size={32} className="text-purple-500" />,
            title: "Tailored Questions",
            description: "AI generates personalized answers for specific job questions based on your unique profile."
        },
        {
            icon: <Shield size={32} className="text-green-500" />,
            title: "Privacy First",
            description: "Your data stays secure. We only use your resume to help you find jobs, never shared without permission."
        }
    ];

    return (
        <section className="py-42 px-4 md:px-12 lg:px-24 w-full bg-light dark:bg-dark">
            <div className="text-center mb-16">
                <h2 className="font-primary text-4xl md:text-5xl text-dark dark:text-light mb-4">
                    Why Next Hire?
                </h2>
                <p className="font-secondary text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
                    Everything you need to supercharge your job search and land your dream role faster.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {features.map((feature, index) => (
                    <div key={index} className="flex flex-col items-center text-center p-4">
                        <div className="mb-6 p-4 bg-stone-100 dark:bg-stone-800 rounded-full">
                            {feature.icon}
                        </div>
                        <h3 className="font-primary text-2xl text-dark dark:text-light mb-3">
                            {feature.title}
                        </h3>
                        <p className="font-secondary text-stone-500 dark:text-stone-400 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}