import React from 'react';

function ContactScreen(): JSX.Element {
    return (
        <div className="relative container mx-auto px-6 md:max-w-6xl md:flex md:flex-col h-36 pt-2">

            {/* Text container */}
            <div className="bg-black rounded-2xl md:right-0 md:bottom-0 md:py-10 pl-10 pr-10 bg-opacity-30 justify-center w-fit">
                <a href="mailto: daniel.badura@outlook.com" className="font-chakra text-gray-900 uppercase max-w-lg text-center md:text-4xl sm:text-xl md:text-center md:mt-0 mt-10 mb-6" >
                    daniel.badura@outlook.com
                </a>

            </div>
        </div>
    );
}

export default ContactScreen;
