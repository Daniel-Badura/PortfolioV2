import React from 'react'


function Header(): JSX.Element {
    return (
        <section id="header">
            {/* front container */}

            <div className="container max-w-6xl mx-auto px-6 py-12 content">
                {/*  Navbar / Logo Container */}
                <nav className="flex items-center justify-between font-bold text-white font-chakra">
                    <h1 className="text-3xl"> Portfolio </h1>
                    <div className="hidden h-10 font-chakra md:flex md:space-x-8">

                        <div className="group">
                            <a href="/">About</a>
                            <div className="mx-2 
                                     group-hover:border-b 
                                    group-hover:border-blue-50">
                            </div>
                        </div>
                        <div className="group">
                            <a href="/projects">Projects</a>
                            <div className="mx-2 
                                     group-hover:border-b 
                                    group-hover:border-blue-50">
                            </div>
                        </div>
                        <div className="group">
                            <a href="/contact">Contact</a>
                            <div className="mx-2 
                                     group-hover:border-b 
                                    group-hover:border-blue-50">
                            </div>
                        </div>
                        <div className="group">
                            <a href="/more">More</a>
                            <div className="mx-2 
                                     group-hover:border-b 
                                    group-hover:border-blue-50">
                            </div>
                        </div>

                    </div>
                    {/* Hamburger menu */}
                </nav>
                {/* Mobile Menu */}
                <div className="rounded-xl max-w-lg mt-32 mb-32 p-4 font-sourceCode text-4xl text-white uppercase border-2 md:p-10 md:m-32 md:mx-0 md:text-6xl">
                    Daniel Badura
                </div>
            </div>
        </section >
    )
}

export default Header