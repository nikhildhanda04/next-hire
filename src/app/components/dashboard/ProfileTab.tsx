'use client'

import { useState } from 'react';
import { useResumeStore } from '@/app/store/resumeStore';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, FileText, Loader2, Save } from 'lucide-react';
import SectionCard from '../common/SectionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ResumeData } from '@/app/store/resumeStore';

interface ProfileTabProps {
    resumeData: ResumeData;
}

interface ExtendedResumeData extends ResumeData {
    preferredName?: string;
    gender?: string;
    race?: string;
    veteran?: string;
    disability?: string;
    citizenship?: string;
    workAuth?: string;
    clearance?: string;
    salary?: string;
    noticePeriod?: string;
}

export default function ProfileTab({ resumeData }: ProfileTabProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: resumeData?.full_name || '',
        email: resumeData?.email || '',
        phone: resumeData?.phone_number || '',
        location: resumeData?.location || '',
        linkedin: resumeData?.linkedin_url || '',
        github: resumeData?.github_url || '',
        portfolio: resumeData?.portfolio_url || '',
        summary: resumeData?.summary || '',
        // New fields
        preferredName: (resumeData as ExtendedResumeData)?.preferredName || '',
        gender: (resumeData as ExtendedResumeData)?.gender || '',
        race: (resumeData as ExtendedResumeData)?.race || '',
        veteran: (resumeData as ExtendedResumeData)?.veteran || '',
        disability: (resumeData as ExtendedResumeData)?.disability || '',
        citizenship: (resumeData as ExtendedResumeData)?.citizenship || '',
        workAuth: (resumeData as ExtendedResumeData)?.workAuth || '',
        clearance: (resumeData as ExtendedResumeData)?.clearance || '',
        salary: (resumeData as ExtendedResumeData)?.salary || '',
        noticePeriod: (resumeData as ExtendedResumeData)?.noticePeriod || ''
    });

    const setResumeData = useResumeStore((state) => state.setResumeData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {

                const updatedData = {
                    ...resumeData,
                    full_name: formData.name,
                    phone_number: formData.phone,
                    location: formData.location,
                    linkedin_url: formData.linkedin,
                    github_url: formData.github,
                    portfolio_url: formData.portfolio,
                    summary: formData.summary,
                    preferredName: formData.preferredName,
                    gender: formData.gender,
                    race: formData.race,
                    veteran: formData.veteran,
                    disability: formData.disability,
                    citizenship: formData.citizenship,
                    workAuth: formData.workAuth,
                    clearance: formData.clearance,
                    salary: formData.salary,
                    noticePeriod: formData.noticePeriod
                };
                setResumeData(updatedData);

            } else {

            }
        } catch (error) {
            console.error('Error updating profile:', error);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 mt-6">
            <SectionCard title="Edit Profile">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} className="pl-9" placeholder="John Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="email" name="email" value={formData.email} disabled className="pl-9 bg-muted" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="pl-9" placeholder="+1 234 567 890" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="location" name="location" value={formData.location} onChange={handleChange} className="pl-9" placeholder="San Francisco, CA" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label>Social Links</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="linkedin" value={formData.linkedin} onChange={handleChange} className="pl-9" placeholder="LinkedIn URL" />
                            </div>
                            <div className="relative">
                                <Github className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="github" value={formData.github} onChange={handleChange} className="pl-9" placeholder="GitHub URL" />
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="portfolio" value={formData.portfolio} onChange={handleChange} className="pl-9" placeholder="Portfolio URL" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label>Demographics & Preferences (For Auto-Fill)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="preferredName">Preferred Name</Label>
                                <Input id="preferredName" name="preferredName" value={formData.preferredName} onChange={handleChange} placeholder="e.g. Nick" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Input id="gender" name="gender" value={formData.gender} onChange={handleChange} placeholder="e.g. Male/Female/Non-binary" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="race">Race / Ethnicity</Label>
                                <Input id="race" name="race" value={formData.race} onChange={handleChange} placeholder="e.g. Asian" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="veteran">Veteran Status</Label>
                                <Input id="veteran" name="veteran" value={formData.veteran} onChange={handleChange} placeholder="e.g. No" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="disability">Disability Status</Label>
                                <Input id="disability" name="disability" value={formData.disability} onChange={handleChange} placeholder="e.g. No" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="citizenship">Citizenship</Label>
                                <Input id="citizenship" name="citizenship" value={formData.citizenship} onChange={handleChange} placeholder="e.g. United States" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workAuth">Work Authorization</Label>
                                <Input id="workAuth" name="workAuth" value={formData.workAuth} onChange={handleChange} placeholder="e.g. Authorized to work in US" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clearance">Security Clearance</Label>
                                <Input id="clearance" name="clearance" value={formData.clearance} onChange={handleChange} placeholder="e.g. None" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary">Salary Expectation</Label>
                                <Input id="salary" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. $120,000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="noticePeriod">Notice Period</Label>
                                <Input id="noticePeriod" name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} placeholder="e.g. 2 weeks" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label htmlFor="summary">Professional Summary</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <textarea
                                id="summary"
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Write a brief professional summary..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </SectionCard>
        </div>
    );
}
