import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { useAppDispatch } from '../app/hooks';
import { listProjects } from '../actions/projectActions';
import Project from '../components/Project';

function ProjectScreen(): JSX.Element {
    const dispatch = useAppDispatch();
    const projectList = useSelector((state: RootState) => state.projectList);
    const { projects } = projectList;

    useEffect(() => {
        if (projectList.error === "initial") {
            dispatch(listProjects())
        }
    }, [dispatch, projectList]);

    return (
        <div className="bg-black project-container py-5">
            {projects?.map((project: any) => (
                <Project key={project.name} image={project.image} name={project.name} href={project.href} stack={project.stack} />
            ))}
        </div>
    );
}

export default ProjectScreen;
