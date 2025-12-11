
export default function Stats() {
    const stats = [
        { label: "Applications Autofilled", value: "10,000+" },
        { label: "Hours Saved", value: "500+" },
        { label: "Success Rate", value: "95%" },
        { label: "Supported Sites", value: "50+" },
    ];

    return (
        <section className="w-full py-12 bg-white dark:bg-black border-y border-stone-100 dark:border-stone-800">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex flex-wrap justify-between items-center gap-8 md:gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex-1 min-w-[140px] text-center">
                            <div className="font-primary text-3xl md:text-5xl text-dark dark:text-light mb-1">
                                {stat.value}
                            </div>
                            <div className="font-secondary text-stone-500 dark:text-stone-400 text-sm md:text-base uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
