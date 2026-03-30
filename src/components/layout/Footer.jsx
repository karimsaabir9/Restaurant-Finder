import { Link } from 'react-router-dom'
import { ChefHat, Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="bg-dark-950 border-t border-dark-800">
            <div className="page-container py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
                                <ChefHat size={18} className="text-white" />
                            </div>
                            <span className="font-bold text-lg text-white">
                                Restaurant<span className="gradient-text">Finder</span>
                            </span>
                        </Link>
                        <p className="text-dark-400 text-sm leading-relaxed max-w-xs">
                            Discover the best restaurants in your city. Read reviews, explore menus, and find your next favorite dining experience.
                        </p>
                        <div className="flex items-center gap-3 mt-5">
                            {[
                                { icon: Instagram, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Facebook, href: '#' },
                            ].map(({ icon: Icon, href }, i) => (
                                <a key={i} href={href}
                                    className="w-9 h-9 rounded-lg bg-dark-800 hover:bg-brand-500 flex items-center justify-center text-dark-400 hover:text-white transition-all duration-200">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4 text-sm">Quick Links</h4>
                        <ul className="space-y-2.5">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/restaurants', label: 'Restaurants' },
                                { to: '/dashboard', label: 'Dashboard' },
                                { to: '/about', label: 'About Us' },
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to}
                                        className="text-dark-400 hover:text-brand-400 text-sm transition-colors duration-200">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4 text-sm">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-dark-400 text-sm">
                                <MapPin size={15} className="mt-0.5 text-brand-500 flex-shrink-0" />
                                <span>123 Food Street, New York, NY 10001</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-dark-400 text-sm">
                                <Phone size={15} className="text-brand-500 flex-shrink-0" />
                                <span>+1 (800) 555-FOOD</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-dark-400 text-sm">
                                <Mail size={15} className="text-brand-500 flex-shrink-0" />
                                <span>hello@restaurantfinder.app</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-dark-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-dark-500 text-sm">© {year} RestaurantFinder. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-dark-500 hover:text-dark-300 text-xs transition-colors">Privacy Policy</a>
                        <a href="#" className="text-dark-500 hover:text-dark-300 text-xs transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
