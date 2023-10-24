import React, { useState } from 'react'


function Header(): JSX.Element {

    const [isActive, setActive] = useState(false);
    const toggleClass = () => {
        setActive(!isActive);
    };



    return (
        <section id="header">
            {/* front container */}

            <div className="container max-w-6xl mx-auto px-6 py-12 content">
                {/*  Navbar / Logo Container */}
                <nav className="flex items-center justify-between font-bold text-white font-chakra">
                    <a href="/" className="text-3xl hover:text-red-600"> Portfolio </a>
                    <div className="hidden h-10 font-chakra md:flex md:space-x-8">

                        <div className="group">
                            <a href="/">About</a>
                            <div className="mx-2 group-hover:border-b group-hover:border-blue-50">
                            </div>
                        </div>
                        <div className="group">
                            <a href="/projects">Projects</a>
                            <div className="mx-2 group-hover:border-b group-hover:border-blue-50">
                            </div>
                        </div>
                        <div className="group">
                            <a href="/contact">Contact</a>
                            <div className="nav-item">
                            </div>
                        </div>
                    </div>

                    {/* Hamburger menu */}

                    <div className="md:hidden">
                        <button onClick={toggleClass}
                            id="menu-btn"
                            type="button"
                            className={`z-40 block hamburger md:hidden focus:outline-none ${isActive ? "open" : ""}`}
                        >
                            <span className="hamburger-top hover:bg-red-500"></span>
                            <span className="hamburger-middle hover:bg-red-500"></span>
                            <span className="hamburger-bottom hover:bg-red-500"></span>
                        </button>
                    </div>
                </nav>
                {/* Mobile Menu */}
                <div id="menu" className={`${isActive ? "flex text-center" : "hidden pl-12 "} absolute top-0 bottom-0 left-0 flex-col self-end w-full min-h-screen py-1 pt-40 space-y-3 text-lg text-white uppercase bg-black`}>
                    <a href="/" className="hover:text-red-600">About</a>
                    <a href="/projects" className="hover:text-red-600">Projects</a>
                    <a href="/contact" className="hover:text-red-600">Contact</a>
                </div>
                <div className="select-none card shadow-animate rounded-xl max-w-lg mt-32 mb-32 p-4 font-sans text-4xl text-white uppercase border-2 md:p-10 md:m-32 md:mx-0 md:text-6xl">
                    Daniel Badura
                </div>
            </div>
        </section >
    )
}

export default Header