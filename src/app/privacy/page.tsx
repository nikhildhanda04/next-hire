import Navbar from "../components/common/navbar";
import Footer from "../components/common/footer";

export const metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy for Next Hire Autofill browser extension.",
};

export default function PrivacyPolicy() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-grow pt-32 pb-20 px-6 md:px-16 container mx-auto max-w-4xl">
                <div className="bg-white dark:bg-neutral-900 shadow-2xl rounded-3xl p-8 md:p-12 border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
                    <h1 className="font-primary text-4xl md:text-6xl text-primary mb-4">Privacy Policy</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-secondary">Effective Date: December 27, 2025</p>

                    <div className="space-y-10 font-secondary text-dark dark:text-light/90 leading-relaxed">
                        <section>
                            <p className="mb-6">
                                Next Hire (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy describes how we handle information in connection with the Next Hire Autofill browser extension.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-dark dark:text-light">1. Information We Collect</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-primary mb-2">A. Information You Provide</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Profile Data:</strong> When you log in, the extension fetches your profile information (name, email, phone, location, work experience, and resume content) from your Next Hire account to fulfill its autofill function.</li>
                                        <li><strong>API Keys:</strong> If you use the &quot;Bring Your Own Key&quot; (BYOK) feature, the extension stores your Google Gemini or OpenAI API keys <strong>locally</strong> on your device. These keys are never stored on our servers.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-primary mb-2">B. Information Collected Automatically</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Page Context:</strong> When you initiate an autofill action, the extension analyzes the structure and visible text of the current webpage to identify where to place your information.</li>
                                        <li><strong>AI Processing Context:</strong> For complex questions, the extension sends specific form fields and a snippet of the page context to our servers to generate AI-powered answers.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-dark dark:text-light">2. How We Use Information</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Autofilling Forms:</strong> To populate job application fields with your saved profile data.</li>
                                <li><strong>AI Assistance:</strong> To generate personalized answers to job application questions based on your resume and the specific job description.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-dark dark:text-light">3. Data Sharing and Third Parties</h2>
                            <p className="mb-4">
                                To provide AI-powered features, we may share anonymized page context and your resume snippets with Google (Gemini) or OpenAI. If you provide your own API key, these requests are sent directly to the respective provider using your key.
                            </p>
                            <p>
                                Our backend is hosted on Vercel, and our database is managed via Prisma/PostgreSQL.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-dark dark:text-light">4. Data Security and Storage</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Local Storage:</strong> Your API keys are stored only on your local machine and are accessible only by the extension.</li>
                                <li><strong>Profile Data:</strong> Your profile data is secured on our central servers. You can manage or delete this data at any time via the Next Hire Dashboard.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-dark dark:text-light">5. Your Rights</h2>
                            <p>
                                You can stop all collection of information by the extension by uninstalling it. You can also clear your stored API keys at any time through the extension settings.
                            </p>
                        </section>

                        <section className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-2xl font-bold mb-4 text-dark dark:text-light">6. Contact Us</h2>
                            <p>
                                If you have questions about this policy, please contact us through the Next Hire platform.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
