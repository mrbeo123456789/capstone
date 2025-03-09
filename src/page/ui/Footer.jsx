export const Footer = () => {
    return (
        <div className="bg-[#140000] text-orange-300 px-4 pt-16">
            <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                {/* Logo & Description */}
                <div className="sm:col-span-2">
                    <a href="/" aria-label="Go home" title="GoBeyond" className="inline-flex items-center">
                        <img src="https://via.placeholder.com/40" alt="GoBeyond Logo" className="h-10 rounded-full" />
                        <span className="ml-2 text-xl font-bold tracking-wide uppercase">
                            GoBeyond
                        </span>
                    </a>
                    <div className="mt-6 lg:max-w-sm">
                        <p className="text-sm">
                            Join GoBeyond to push your fitness limits. Track challenges, compete, and achieve new milestones every day.
                        </p>
                        <p className="mt-4 text-sm">
                            Stay consistent, stay fit, and go beyond your limits!
                        </p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                    <p className="text-base font-bold tracking-wide">Contacts</p>
                    <div className="flex">
                        <p className="mr-1">Phone:</p>
                        <a href="tel:850-123-5021" className="hover:text-red-500">
                            +1 (850) 123-5021
                        </a>
                    </div>
                    <div className="flex">
                        <p className="mr-1">Email:</p>
                        <a href="mailto:info@gobeyond.com" className="hover:text-red-500">
                            info@gobeyond.com
                        </a>
                    </div>
                    <div className="flex">
                        <p className="mr-1">Address:</p>
                        <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="hover:text-red-500">
                            123 Fitness Street, NY
                        </a>
                    </div>
                </div>

                {/* Social Media */}
                <div>
                    <span className="text-base font-bold tracking-wide">Follow Us</span>
                    <div className="flex items-center mt-2 space-x-4">
                        <a href="/" className="hover:text-red-500">
                            <i className="fab fa-facebook-f text-lg"></i>
                        </a>
                        <a href="/" className="hover:text-red-500">
                            <i className="fab fa-instagram text-lg"></i>
                        </a>
                        <a href="/" className="hover:text-red-500">
                            <i className="fab fa-twitter text-lg"></i>
                        </a>
                        <a href="/" className="hover:text-red-500">
                            <i className="fab fa-youtube text-lg"></i>
                        </a>
                    </div>
                    <p className="mt-4 text-sm">
                        Join our community and stay updated with the latest fitness challenges.
                    </p>
                </div>
            </div>

            {/* Footer Bottom Section */}
            <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t border-orange-500 lg:flex-row">
                <p className="text-sm">
                    © 2025 GoBeyond Inc. All rights reserved.
                </p>
                <ul className="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
                    <li>
                        <a href="/" className="text-sm hover:text-red-500">
                            F.A.Q
                        </a>
                    </li>
                    <li>
                        <a href="/" className="text-sm hover:text-red-500">
                            Privacy Policy
                        </a>
                    </li>
                    <li>
                        <a href="/" className="text-sm hover:text-red-500">
                            Terms & Conditions
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};
