import React from 'react';
import Project from './Project';

function Projects(): JSX.Element {
    return (
        <section id="projects">
            <div className="max-w-6xl mx-auto my-32 px-6 text-gray-900 md:px-0">
                {/* Projects Header */}
                <div className="flex justify-center mb-20 md:justify-between">
                    <h2 className="text-4xl text-center uppercase md:text-left md:text-5xl">
                        My Projects
                    </h2>
                    <button className="hidden btn md:block">
                        SEE ALL
                    </button>
                </div>
                {/* Item container */}
                <Project />
            </div>
        </section>
    );
}

export default Projects;
