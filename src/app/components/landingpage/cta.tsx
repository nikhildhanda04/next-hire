'use client';

export default function CTA() {
    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <section className="py-24 px-4 bg-white dark:bg-black">
            <div className="max-w-4xl mx-auto text-center bg-primary/5 dark:bg-primary/10 rounded-3xl p-12 border border-primary/20">
                <h2 className="font-primary text-4xl md:text-5xl text-dark dark:text-light mb-6">
                    Ready to land your dream job?
                </h2>
                <p className="font-secondary text-xl text-stone-500 dark:text-stone-400 mb-10 max-w-xl mx-auto">
                    Join thousands of job seekers who are saving time and getting hired faster with Next Hire.
                </p>
                <button
                    onClick={handleScrollToTop}
                    className="font-secondary text-lg bg-primary text-light px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1"
                >
                    Get Started for Free
                </button>
            </div>
        </section>
    );
}
