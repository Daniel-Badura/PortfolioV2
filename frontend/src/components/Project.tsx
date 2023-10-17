import React from 'react'

interface ProjectProps {
    name: string
    image: string
    href: string
}

function Project({ image, name, href }: ProjectProps): JSX.Element {
    return (

        <a className="group item" href={href}>
            {/* desktop image */}
            <img src={image} alt="" className="hidden w-full duration-200 md:block group-hover:scale-110 " />
            {/* mobile image */}
            <img src={image} alt="" className='md:hidden w-full' />
            {/* gradient */}
            <div className="item-gradient">
            </div>
            <h5 className="font-bold absolute px-6 duration-200 w-52 bottom-4 md:bottom-8 md:px-10 group-hover:scale-110 group-hover:text-black">
                {name}
            </h5>

        </a >
    )
}

export default Project