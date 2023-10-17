import React from 'react'

interface ProjectProps {
    name: string
    image: string
    href: string
    stack: string
}

function Project({ image, name, href, stack }: ProjectProps): JSX.Element {
    return (

        <a className="group item rounded-xl h-74" href={href}>
            {/* desktop image */}
            <img src={image} alt="" className="hidden h-full duration-200 md:block group-hover:scale-110 " />
            {/* mobile image */}
            <img src={image} alt="" className='md:hidden w-full' />
            {/* gradient */}
            <div className="item-gradient">
            </div>
            <h5 className="font-bold absolute px-6 duration-200 w-full bottom-4 md:bottom-8 md:px-10 group-hover:scale-110 group-hover:text-black">
                {name}
            </h5>
            <h5 className="text-transparent text-base absolute px-6 duration-200 w-full top-4 md:bottom-8 md:px-10 group-hover:scale-110  group-hover:text-red-600">
                {stack}
            </h5>
        </a >
    )
}

export default Project