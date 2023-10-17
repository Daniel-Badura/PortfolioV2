import React from 'react';

function Feature(): JSX.Element {
    return (
        <section id="feature" className="my-32 parallax-container">
            <div className="relative container mx-auto px-6 md:max-w-6xl md:flex md:flex-col">
                {/* Image */}
                <img
                    src="/images/Daniel4.jpg"
                    alt=""
                    className="rounded-2xl md:max-w-2xl"
                />
                {/* Text container */}
                <div className="bg-white rounded-2xl md:absolute md:right-0 md:bottom-0 md:py-10 md:pl-10 pr-0 bg-opacity-30">
                    <h2 className="text-4xl font-chakra text-gray-900 uppercase max-w-lg text-center md:text-5xl md:text-center md:mt-0 mt-10 mb-6">
                        LOOK AT ME SMILING!
                    </h2>
                    <p className="max-w-md text-center md:text-left">
                        Eat some lorem ipsum
                        dolor sit amet consectetur adipisicing elit. Error eos
                        beatae laborum vel distinctio optio soluta, quis harum velit
                        maiores libero laudantium rem ex ullam dolores officia quidem fugit
                        necessitatibus.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Feature;
