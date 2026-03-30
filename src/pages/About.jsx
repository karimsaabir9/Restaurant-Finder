import { Link } from 'react-router-dom'
import { ChefHat, Target, Heart, Users, Award, Star, ArrowRight } from 'lucide-react'

const TEAM = [
    { name: 'Alex Johnson', role: 'CEO & Co-Founder', emoji: '👨‍💼', bio: 'Food enthusiast and tech visionary with 10+ years in the restaurant industry.' },
    { name: 'Maria Garcia', role: 'Head of Curation', emoji: '👩‍🍳', bio: 'Culinary expert and food blogger who personally vets every restaurant on our platform.' },
    { name: 'Sam Chen', role: 'CTO', emoji: '👨‍💻', bio: 'Full-stack engineer passionate about building seamless digital experiences for food lovers.' },
    { name: 'Priya Patel', role: 'Community Manager', emoji: '👩‍💼', bio: 'Building and nurturing the RestaurantFinder community of food lovers worldwide.' },
]

const VALUES = [
    { icon: Target, title: 'Our Mission', desc: 'To connect food lovers with the best restaurants in their city through honest ratings, real reviews, and curated recommendations.' },
    { icon: Heart, title: 'Our Values', desc: 'We believe great food brings people together. We champion authenticity, inclusivity, and a love for diverse culinary traditions.' },
    { icon: Award, title: 'Our Quality', desc: 'Every restaurant is carefully vetted. We maintain high standards to ensure you always have a great dining experience.' },
]

export default function About() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
                </div>
                <div className="page-container text-center relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow animate-float">
                        <ChefHat size={28} className="text-white" />
                    </div>
                    <h1 className="section-title text-4xl md:text-5xl mb-4">About RestaurantFinder</h1>
                    <p className="text-dark-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        We're on a mission to help food lovers everywhere discover their next favorite restaurant. Built by food enthusiasts, for food enthusiasts.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 border-t border-dark-800">
                <div className="page-container">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {VALUES.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="card p-7 text-center group hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-500/20 transition-colors">
                                    <Icon size={20} className="text-brand-400" />
                                </div>
                                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                                <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-16 bg-dark-900/50 border-y border-dark-800">
                <div className="page-container">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="section-title mb-6">Our Story</h2>
                        <div className="space-y-4 text-dark-300 leading-relaxed">
                            <p>
                                RestaurantFinder was born out of a simple frustration: finding a great restaurant shouldn't be this hard. Our founders, avid food enthusiasts themselves, were tired of wading through unreliable reviews and outdated information.
                            </p>
                            <p>
                                In 2024, we launched RestaurantFinder with a curated database of hand-picked restaurants, a community of trusted reviewers, and a commitment to transparency. Today, we connect thousands of diners with amazing restaurants every day.
                            </p>
                            <p>
                                We believe that every meal is an opportunity for an adventure. Whether you're celebrating a special occasion or just looking for a great weeknight dinner, RestaurantFinder has you covered.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16">
                <div className="page-container">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { value: '500+', label: 'Restaurants Listed' },
                            { value: '50,000+', label: 'Reviews Written' },
                            { value: '10,000+', label: 'Happy Members' },
                            { value: '4.8★', label: 'Average Rating' },
                        ].map(({ value, label }) => (
                            <div key={label} className="card p-6">
                                <div className="text-3xl font-black gradient-text mb-1">{value}</div>
                                <div className="text-dark-400 text-sm">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-16 bg-dark-900/50 border-t border-dark-800">
                <div className="page-container">
                    <div className="text-center mb-10">
                        <h2 className="section-title">Meet The Team</h2>
                        <p className="section-subtitle">The food lovers behind RestaurantFinder</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TEAM.map(member => (
                            <div key={member.name} className="card p-6 text-center group hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-glow">
                                    {member.emoji}
                                </div>
                                <h3 className="font-bold text-white mb-0.5">{member.name}</h3>
                                <p className="text-brand-400 text-xs mb-3">{member.role}</p>
                                <p className="text-dark-400 text-xs leading-relaxed">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 border-t border-dark-800">
                <div className="page-container text-center">
                    <h2 className="text-2xl font-bold text-white mb-3">Ready to discover amazing food?</h2>
                    <p className="text-dark-400 mb-6">Join our community and start exploring the best restaurants today.</p>
                    <Link to="/restaurants" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                        Explore Restaurants <ArrowRight size={15} />
                    </Link>
                </div>
            </section>
        </div>
    )
}
