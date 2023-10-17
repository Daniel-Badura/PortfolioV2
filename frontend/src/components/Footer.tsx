import React from 'react'

function Footer(): JSX.Element {
    return (
        <footer className="bg-black">
            <div className="container max-w-6xl py-10 mx-auto">
                <div
                    className="flex flex-col items-center mb-8 space-y-6 md:flex-row md:space-y-0 md:justify-between md:items-start"
                >
                    <div
                        className="flex flex-col items-center space-y-8 md:items-start md:space-y-4"
                    >
                        <div className="h-8">
                            <img src="/./images/logo.svg" alt="" className="w-44 md:ml-3" />
                        </div>
                        <div
                            className="flex flex-col items-center space-y-4 font-bold text-white md:flex-row md:space-y-0 md:space-x-6 md:ml-3"
                        >
                            <div className="h-10 group">
                                <a href="/">About</a>
                                <div
                                    className="mx-2 group-hover:border-b group-hover:border-blue-50"
                                ></div>
                            </div>
                            <div className="h-10 group">
                                <a href="/projects">Projects</a>
                                <div
                                    className="mx-2 group-hover:border-b group-hover:border-blue-50"
                                ></div>
                            </div>
                            <div className="h-10 group">
                                <a href="/contact">Contact</a>
                                <div
                                    className="mx-2 group-hover:border-b group-hover:border-blue-50"
                                ></div>
                            </div>

                        </div>
                    </div>

                    <div
                        className="flex flex-col items-start justify-between space-y-4 text-gray-500"
                    >
                        <div
                            className="flex items-center justify-center mx-auto space-x-4 md:justify-end md:mx-0  "
                        >
                            <div className="h-8 group hover:scale-125 transition">
                                <a href="https://github.com/Daniel-Badura">
                                    <img src="./images/github-mark-white.svg" alt="" className="h-6" />
                                </a>
                            </div>
                            <div className="h-8 group hover:scale-125 transition">
                                <a href="https://www.linkedin.com/in/daniel-badura/">
                                    <img src="./images/linkedin.svg" alt="" className="h-6" />
                                </a>
                            </div>
                            <div className="h-8 group hover:scale-125 transition">
                                <a href="/facebook">
                                    <img src="./images/facebook.svg" alt="" className="h-6" />
                                </a>
                            </div>
                            <div className="h-8 group hover:scale-125 transition">
                                <a href="/instagram">
                                    <img src="./images/instagram.svg" alt="" className="h-6" />
                                </a>
                            </div>
                            <div className="h-8 group hover:scale-125 transition">
                                <a href="https://twitter.com/danbad2741">
                                    <img src="./images/twitter.svg" alt="" className="h-6" />
                                </a>
                            </div>
                        </div>
                        <div className="font-bold">
                            &copy; 2023 Daniel-Badura-Portfolio
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer