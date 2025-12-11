import { Star } from "lucide-react";

export default function Testimonials() {
    const reviews = [
        {
            name: "Sarah J.",
            role: "Software Engineer",
            content: "Next Hire saved me hours of typing. I applied to 50 jobs in one afternoon and got 3 interviews!",
            stars: 5,
        },
        {
            name: "Michael C.",
            role: "Product Manager",
            content: "The tailored answers are a game changer. It actually sounds like me, but better.",
            stars: 5,
        },
        {
            name: "Emily R.",
            role: "Marketing Specialist",
            content: "I love the dashboard tracking. Finally, I know where all my applications stand.",
            stars: 4,
        }
    ];

    return (
        <section className="py-36 px-4 bg-light dark:bg-dark">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-primary text-4xl md:text-5xl text-dark dark:text-light mb-4">
                        Loved by Job Seekers
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <div key={index} className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={`${i < review.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                                    />
                                ))}
                            </div>
                            <p className="font-secondary text-lg text-dark dark:text-light mb-6">
                                "{review.content}"
                            </p>
                            <div>
                                <div className="font-primary text-lg text-dark dark:text-light">{review.name}</div>
                                <div className="font-secondary text-sm text-stone-500 dark:text-stone-400">{review.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
