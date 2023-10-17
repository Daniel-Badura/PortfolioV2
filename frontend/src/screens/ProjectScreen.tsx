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
        <div className="project-container">
            {projects?.map((project: any) => (
                <Project key={project.name} image={project.image} name={project.name} href={project.href} />
            ))}
        </div>
    );
}

export default ProjectScreen;
