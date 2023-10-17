import React, { useEffect } from 'react';
import Project from './Project';
import { useSelector } from "react-redux";
import { listProjects } from '../actions/projectActions';
import { RootState } from '../app/store';
import { useAppDispatch } from '../app/hooks';




function Projects(): JSX.Element {

    // const [data, setData] = useState<any>(null);
    const dispatch = useAppDispatch();
    const projectList = useSelector((state: RootState) => state.projectList);
    const { projects } = projectList;
    useEffect(() => {
        if (projectList.error === "initial") {
            dispatch(listProjects())
        }
    }, [dispatch, projectList]);

    return (
        <section id="projects">
            <div className="font-chakra container max-w-6xl mx-auto my-32 px-6 text-gray-900 md:px-0">
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
                <div className="item-container">
                    {projects?.slice(0, 4).map((project: any) => (
                        <Project key={project.name} image={project.image} name={project.name} href={project.href} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Projects;
