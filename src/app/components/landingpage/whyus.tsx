import { FileText, Zap, MessageSquare, Shield, Key, Target } from "lucide-react";

export default function Features() {
    const features = [
        {
            icon: <FileText size={32} className="text-blue-500" />,
            title: "Smart Context parsing",
            description: "Stop repeating yourself. Our AI extracts your entire professional history and understands context like a human—ensuring every field is filled with 100% accuracy."
        },
        {
            icon: <Zap size={32} className="text-yellow-500" />,
            title: "Superhuman Speed",
            description: "What takes you 15 minutes, takes AI 15 seconds. Fill complex, multi-page applications instantly and apply to 10x more jobs without burnout."
        },
        {
            icon: <MessageSquare size={32} className="text-purple-500" />,
            title: "Tailored Responses",
            description: "Stuck on 'Why us?' or 'Describe a challenge'? AI generates unique, persuasive answers tailored to *your* experience and *that* specific job description. No more generic fluff."
        },
        {
            icon: <Key size={32} className="text-orange-500" />,
            title: "Unlimited AI Freedom",
            description: "Bring your own Gemini or OpenAI API key. Control your own model (GPT-4o, Gemini 2.0), enjoy zero rate limits, and run at maximum velocity."
        },
        {
            icon: <Shield size={32} className="text-green-500" />,
            title: "Privacy by Design",
            description: "Your data creates your advantage, not ours. Your resume and keys are stored locally in your browser and used only to power *your* applications."
        },
        {
            icon: <Target size={32} className="text-red-500" />,
            title: "ATS Optimization",
            description: "Beat the bots. We intelligently align your resume keywords with the job description, maximizing your chances of passing automated screenings."
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